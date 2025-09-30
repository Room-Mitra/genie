terraform {
  backend "s3" {
    bucket        = "roommitra-terraform-state"   # your bucket
    key           = "prod/terraform.tfstate"      # pick any prefix/key you like
    region        = "ap-south-1"
    encrypt       = true
    use_lockfile  = true                           # replaces dynamodb_table
  }
}
