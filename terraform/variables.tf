# terraform/variables.tf

variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  default     = "mindfulpath"
}

variable "db_name" {
  description = "Database name"
  default     = "mindfulpath_db"
}

variable "db_user" {
  description = "Database username"
  default     = "mindful_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.medium"
}

variable "container_port" {
  description = "Container port"
  default     = 8000
}

variable "secret_key" {
  description = "JWT secret key"
  sensitive   = true
}

variable "stripe_key" {
  description = "Stripe API key"
  sensitive   = true
}

variable "razorpay_key" {
  description = "Razorpay API key"
  sensitive   = true
}
