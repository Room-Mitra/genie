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

variable "website_image_uri" {
  type        = string
  description = "ECR URI for the website Docker image"
  default     = "public.ecr.aws/p1s3y6q3/roommitra/website:latest"
}

variable "api_image_uri" {
  type        = string
  description = "ECR URI for the API Docker image"
  default     = "public.ecr.aws/p1s3y6q3/roommitra/api:latest"
}

variable "webapp_image_uri" {
  type        = string
  description = "ECR URI for the webapp Docker image"
  default     = "public.ecr.aws/p1s3y6q3/roommitra/webapp:latest"
}

variable "ecr_registry" {
  type        = string
  description = "ECR registry URI"
  default     = "086325458599.dkr.ecr.ap-south-1.amazonaws.com"

}
