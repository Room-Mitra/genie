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

resource "aws_dynamodb_table" "entity" {
  name         = "ENTITY"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk" # e.g., HOTEL#<hotelId> or USER#<userId> or ROOM#<roomId>
  range_key = "sk" # e.g., ENTITY#<entityId> or REQUEST#<requestId> or META#<something>

  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }
  # GSI attributes
  attribute {
    name = "hotelId"
    type = "S"
  }
  attribute {
    name = "entityTypeTimestamp"
    type = "S" # format: <ENTITYTYPE>#<ISO8601>
  }
  attribute {
    name = "roomId"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi_hotelId_entityTypeTs"
    hash_key        = "hotelId"
    range_key       = "entityTypeTimestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "gsi_roomId_entityTypeTs"
    hash_key        = "roomId"
    range_key       = "entityTypeTimestamp"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    service = "roommitra"
    table   = "entity"
    env     = "prod"
  }
}
