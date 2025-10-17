resource "aws_dynamodb_table" "devices" {
  name         = "DEVICES"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "deviceId"

  attribute {
    name = "deviceId"
    type = "S"
  }

  # Optional server side encryption managed by AWS owned key
  server_side_encryption {
    enabled = true
  }

  tags = {
    Project = "room-mitra"
    Env     = "prod"
  }
}

resource "aws_dynamodb_table" "guest" {
  name         = "GUEST"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"


  attribute {
    name = "id"
    type = "S"
  }


  server_side_encryption {
    enabled = true
  }


  tags = {
    Project = "room-mitra"
    Env     = "prod"
  }
}

resource "aws_dynamodb_table" "intents" {
  name         = "INTENTS"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "daysSinceEpoch"


  attribute {
    name = "daysSinceEpoch"
    type = "N"
  }


  server_side_encryption {
    enabled = true
  }

  tags = {
    Project = "room-mitra"
    Env     = "prod"
  }
}
