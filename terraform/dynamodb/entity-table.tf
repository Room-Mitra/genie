# =========================
# DynamoDB: entity (single-table)
# =========================
resource "aws_dynamodb_table" "entity" {
  name         = "ENTITY"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  # ---------- Attribute Definitions ----------
  # Table keys
  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }

  # GSI: HotelTypeTime
  attribute {
    name = "hotelType_pk"
    type = "S"
  }
  attribute {
    name = "hotelType_sk"
    type = "S"
  }

  # GSI: RoomTypeTime
  attribute {
    name = "roomType_pk"
    type = "S"
  }
  attribute {
    name = "roomType_sk"
    type = "S"
  }

  # GSI: RequestStatus
  attribute {
    name = "status_pk"
    type = "S"
  }
  attribute {
    name = "status_sk"
    type = "S"
  }

  # GSI: AssigneeWorkload
  attribute {
    name = "assignee_pk"
    type = "S"
  }
  attribute {
    name = "assignee_sk"
    type = "S"
  }

  # GSI: UserEmail
  attribute {
    name = "email_pk"
    type = "S"
  }
  attribute {
    name = "email_sk"
    type = "S"
  }

  # GSI: DeviceBinding
  attribute {
    name = "device_pk"
    type = "S"
  }
  attribute {
    name = "device_sk"
    type = "S"
  }

  attribute {
    name = "conversation_pk"
    type = "S"
  }
  attribute {
    name = "conversation_sk"
    type = "S"
  }

  # ---------- Global Secondary Indexes ----------
  # 1) Hotel-wide time-sorted listing (recent requests/messages/devices)
  global_secondary_index {
    name            = "GSI_HotelTypeTime"
    hash_key        = "hotelType_pk"
    range_key       = "hotelType_sk"
    projection_type = "INCLUDE"
    non_key_attributes = [
      # Keep this lean; add/remove based on UI needs
      "entityType", "summary", "status", "priority", "roomId", "requestId", "createdAtEpoch"
    ]
  }

  # 2) Room timeline (requests/messages/devices per room)
  global_secondary_index {
    name            = "GSI_RoomTypeTime"
    hash_key        = "roomType_pk"
    range_key       = "roomType_sk"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "entityType", "status", "priority", "hotelId", "roomId", "requestId", "createdAtEpoch"
    ]
  }

  # 3) Request boards by status (Open/InProgress/Done)
  global_secondary_index {
    name            = "GSI_RequestStatus"
    hash_key        = "status_pk"
    range_key       = "status_sk"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "entityType", "summary", "priority", "hotelId", "roomId", "requestId", "assignedToUserId", "createdAtEpoch"
    ]
  }

  # 4) Staff workload (requests assigned to a user)
  global_secondary_index {
    name            = "GSI_AssigneeWorkload"
    hash_key        = "assignee_pk"
    range_key       = "assignee_sk"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "entityType", "status", "priority", "hotelId", "roomId", "requestId", "createdAtEpoch"
    ]
  }

  # 5) Login/email lookup
  global_secondary_index {
    name            = "GSI_UserEmail"
    hash_key        = "email_pk"
    range_key       = "email_sk"
    projection_type = "KEYS_ONLY"
  }

  # 6) Device→room/hotel binding
  global_secondary_index {
    name               = "GSI_DeviceBinding"
    hash_key           = "device_pk"
    range_key          = "device_sk"
    projection_type    = "INCLUDE"
    non_key_attributes = ["hotelId", "roomId", "deviceId", "lastSeenEpoch", "state"]
  }

  # 7) Messages by Conversation
  global_secondary_index {
    name               = "GSI_ConversationMessages"
    hash_key           = "conversation_pk"
    range_key          = "conversation_sk"
    projection_type    = "INCLUDE"
    non_key_attributes = ["senderType", "content", "createdAtEpoch"]

  }

  # ---------- Table Options ----------
  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    attribute_name = "ttlEpoch" # optional; only set on items you want to auto-expire
    enabled        = true
  }

  tags = {
    Project = "RoomMitra"
    Env     = "prod"
  }
}

# Optional: outputs
output "entity_table_name" {
  value = aws_dynamodb_table.entity.name
}
