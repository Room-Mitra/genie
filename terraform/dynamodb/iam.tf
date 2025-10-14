# Look up the existing role attached to your EC2 instance
data "aws_iam_role" "ec2_role" {
  name = var.existing_instance_role_name
}

# Create a least privilege policy scoped to the specific tables
data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    sid = "ReadWriteTables"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:ConditionCheckItem",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "dynamodb:DescribeTable",
      "dynamodb:ListTagsOfResource"
    ]
    resources = [
      aws_dynamodb_table.devices.arn,
      "${aws_dynamodb_table.devices.arn}/index/*",
      aws_dynamodb_table.guest.arn,
      "${aws_dynamodb_table.guest.arn}/index/*",
      aws_dynamodb_table.intents.arn,
      "${aws_dynamodb_table.intents.arn}/index/*",
    ]
  }

  # Optional. Allow creating on-demand backups and reading them
  statement {
    sid = "BackupAndRestore"
    actions = [
      "dynamodb:CreateBackup",
      "dynamodb:DescribeBackup",
      "dynamodb:RestoreTableFromBackup"
    ]
    resources = ["*"]
  }

  # Optional. Allow describing limits and listing tables for diagnostics
  statement {
    sid       = "AccountLevelReadOnly"
    actions   = ["dynamodb:ListTables", "dynamodb:DescribeLimits"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "ec2-dynamodb-access"
  description = "Least privilege access for EC2 to specific DynamoDB tables"
  policy      = data.aws_iam_policy_document.dynamodb_access.json
}

resource "aws_iam_role_policy_attachment" "attach_to_role" {
  role       = data.aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}
