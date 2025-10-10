variable "existing_instance_role_name" {
  description = "Name of the IAM role already attached to your EC2 instance profile"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where your EC2 lives"
  type        = string
}
