terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 5.0" }
  }
}

locals {
  app_name = "${var.name}-app"
  dg_name  = "${var.name}-dg"
  bucket   = var.create_bucket ? "${var.name}-codedeploy-${var.region}" : var.bucket_name
}

# S3 bucket for deployment bundles (optional)
resource "aws_s3_bucket" "deploy" {
  count         = var.create_bucket ? 1 : 0
  bucket        = local.bucket
  force_destroy = true
}

# Role that CodeDeploy SERVICE assumes (not your GitHub OIDC role)
data "aws_iam_policy_document" "codedeploy_trust" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["codedeploy.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "codedeploy_service_role" {
  name               = "${var.name}-codedeploy-svc"
  assume_role_policy = data.aws_iam_policy_document.codedeploy_trust.json
}
resource "aws_iam_role_policy_attachment" "codedeploy_attach" {
  role       = aws_iam_role.codedeploy_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

# CodeDeploy Application
resource "aws_codedeploy_app" "app" {
  name             = local.app_name
  compute_platform = "Server"
}

resource "aws_codedeploy_deployment_group" "dg" {
  app_name               = aws_codedeploy_app.app.name
  deployment_group_name  = "${var.name}-dg"
  service_role_arn       = aws_iam_role.codedeploy_service_role.arn
  deployment_config_name = var.deployment_config_name

  # Target by EC2 tag (single instance OK)
  ec2_tag_set {
    ec2_tag_filter {
      key   = var.instance_tag_key # e.g., "Role"
      type  = "KEY_AND_VALUE"
      value = var.instance_tag_value # e.g., "web"
    }
  }

  auto_rollback_configuration {
    enabled = var.rollback_on_failure
    events  = ["DEPLOYMENT_FAILURE"]
  }

  # Optional alarms if you have them
  dynamic "alarm_configuration" {
    for_each = length(var.alarm_names) > 0 ? [1] : []
    content {
      enabled = true
      alarms  = [for n in var.alarm_names : { name = n }]
    }
  }
}
