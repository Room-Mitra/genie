variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-south-1"
}

variable "aws_profile" {
  type        = string
  description = "AWS CLI profile"
  default     = "default"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "create_key_pair" {
  type    = bool
  default = false
}

variable "public_key_openssh" {
  type        = string
  default     = ""
  description = "Only used if create_key_pair = true"
}

variable "tags" {
  type = map(string)
  default = {
    Project = "RoomMitra"
  }
}
