
# Configure the DigitalOcean Provider
provider "digitalocean" {
  token = "${var.do_token}"
}

# Create a web server
resource "digitalocean_droplet" "app" {
  image  = "ubuntu-18-04-x64"
  name   = "app-1"
  region = "sgp1"
  size   = "s-1vcpu-1gb"
}