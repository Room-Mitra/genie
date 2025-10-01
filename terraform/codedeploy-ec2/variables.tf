variable "name" {
  type = string
} # logical base name, e.g. "roommitra-web"
variable "create_bucket" {
  type    = bool
  default = true
}
variable "bucket_name" {
  type    = string
  default = null
}
variable "region" { type = string }

# What EC2 targets to deploy to (pick one of the two)
variable "instance_tag_key" {
  type    = string
  default = "Name"
}
variable "instance_tag_value" {
  type    = string
  default = ""
}

# Deployment behavior
variable "deployment_config_name" {
  type    = string
  default = "CodeDeployDefault.OneAtATime"
}
variable "rollback_on_failure" {
  type    = bool
  default = true
}

# Optional CloudWatch Alarms (names)
variable "alarm_names" {
  type    = list(string)
  default = []
}
