# -- Identity
data "aws_caller_identity" "me" {}

# -- Networking (use default VPC to stay free/zero-config)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# -- AMI: Amazon Linux 2023 (x86_64)
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["137112412989"] # Amazon
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# -- Security Group: allow HTTP/HTTPS only
resource "aws_security_group" "web" {
  name        = "rm-web-sg"
  description = "Allow web in; all out"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description      = "HTTP"
    protocol         = "tcp"
    from_port        = 80
    to_port          = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS"
    protocol         = "tcp"
    from_port        = 443
    to_port          = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  // Optional SSH (not recommended; use SSM instead)
  # ingress {
  #   description      = "SSH"
  #   protocol         = "tcp"
  #   from_port        = 22
  #   to_port          = 22
  #   cidr_blocks      = ["0.0.0.0/0"]
  #   ipv6_cidr_blocks = ["::/0"]
  # }

  egress {
    description      = "All egress"
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = var.tags
}

# -- IAM: SSM access (Session Manager, no SSH)
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ssm_role" {
  name               = "rm-ec2-ssm-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "rm-ec2-ssm-instance-profile"
  role = aws_iam_role.ssm_role.name
}

# -- Optional SSH keypair (kept disabled)
resource "aws_key_pair" "rm_key" {
  count      = var.create_key_pair ? 1 : 0
  key_name   = "rm-ec2-key"
  public_key = var.public_key_openssh
}

# -- EC2 instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = element(data.aws_subnets.default.ids, 0)
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name

  # If you really want SSH, flip create_key_pair=true and uncomment:
  # key_name = aws_key_pair.rm_key[0].key_name


  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8 # <— increase this
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    AWS_REGION        = var.aws_region
    WEBSITE_IMAGE_URI = var.website_image_uri
    API_IMAGE_URI     = var.api_image_uri
    WEBAPP_IMAGE_URI  = var.webapp_image_uri
    REGISTRY          = var.ecr_registry

  })
  user_data_replace_on_change = true

  tags = merge(var.tags, {
    Name = "roommitra-ec2"
  })
}

# -- Elastic IP (free while attached)
resource "aws_eip" "web" {
  instance = aws_instance.web.id
  domain   = "vpc"
  tags     = var.tags
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}
