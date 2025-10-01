output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = aws_eip.web.public_ip
}

output "ssm_tunnel_hints" {
  value = "Use: aws ssm start-session --target ${aws_instance.web.id} --profile roommitra"
}
