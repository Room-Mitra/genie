output "devices_table_arn" {
  value = aws_dynamodb_table.devices.arn
}

output "guest_table_arn" {
  value = aws_dynamodb_table.guest.arn
}

output "intents_table_arn" {
  value = aws_dynamodb_table.intents.arn
}
