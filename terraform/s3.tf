
# 1) The bucket (pick a globally-unique name)
resource "aws_s3_bucket" "assets" {
  bucket = "roommitra-assets-bucket"
  tags = {
    Name        = "roommitra-assets"
    Environment = "dev"
  }
}

# 2) Ownership controls (no ACLs needed)
resource "aws_s3_bucket_ownership_controls" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# 3) Allow *public policies* on this bucket (turn off the blockers)
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

# 4) Public READ policy for objects
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.assets.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = "${aws_s3_bucket.assets.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.assets,
    aws_s3_bucket_ownership_controls.assets
  ]
}

# 5) (Optional) CORS so browsers can fetch images directly
resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    max_age_seconds = 300
  }
}
