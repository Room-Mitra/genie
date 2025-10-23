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


locals {
  table_keys = [
    { name = "pk", type = "S" },
    { name = "sk", type = "S" },
  ]

  gsis = [
    # Hotel Type
    { name = "GSI_HotelType", hash = "hotelType_pk", range = "hotelType_sk" },

    # Room Type
    { name = "GSI_RoomType", hash = "roomType_pk", range = "roomType_sk" },

    # Status
    { name = "GSI_Status", hash = "status_pk", range = "status_sk" },

    # Assignee Workload
    { name = "GSI_AssigneeType", hash = "assigneeType_pk", range = "assigneeType_sk" },

    # Conversation Type
    { name = "GSI_ConversationType", hash = "conversationType_pk", range = "conversationType_sk" },

    # Booking Type
    { name = "GSI_BookingType", hash = "bookingType_pk", range = "bookingType_sk" },
  ]

  # Build a unique set of attribute definitions actually used
  gsi_keys = flatten([
    for g in local.gsis : [
      { name = g.hash, type = "S" },
      { name = g.range, type = "S" },
    ]
  ])

  all_keys = distinct(concat(local.table_keys, local.gsi_keys))
}

resource "aws_dynamodb_table" "entity" {
  name         = "ENTITY"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  # Emit only used attributes
  dynamic "attribute" {
    for_each = { for a in local.all_keys : a.name => a }
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  # GSIs
  dynamic "global_secondary_index" {
    for_each = { for g in local.gsis : g.name => g }
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hash
      range_key       = global_secondary_index.value.range
      projection_type = "ALL"
    }
  }

  point_in_time_recovery { enabled = true }
  server_side_encryption { enabled = true }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    service = "roommitra"
    table   = "entity"
    env     = "prod"
  }
}
