# terraform/terraform.tfvars

aws_region = "us-east-1"
environment = "production"
app_name = "mindfulpath"
db_name = "mindfulpath_db"
db_user = "mindful_admin"
# db_password and secrets are set via environment variables or AWS_* vars

instance_type = "t3.medium"
container_port = 8000
