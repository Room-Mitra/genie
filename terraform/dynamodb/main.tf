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
    name = "hotelType_pk"
    type = "S"
  }

  attribute {
    name = "hotelType_sk"
    type = "S"
  }

  attribute {
    name = "roomType_pk"
    type = "S"
  }

  attribute {
    name = "roomType_sk"
    type = "S"
  }

  attribute {
    name = "statusType_pk"
    type = "S"
  }

  attribute {
    name = "statusType_sk"
    type = "S"
  }

  attribute {
    name = "assignee_pk"
    type = "S"
  }
  attribute {
    name = "assignee_sk"
    type = "S"
  }

  attribute {
    name = "booking_pk"
    type = "S"
  }

  attribute {
    name = "booking_sk"
    type = "S"
  }

  attribute {
    name = "conversation_pk"
    type = "S"
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
