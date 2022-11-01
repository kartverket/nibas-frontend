terraform {
  backend "gcs" {
    prefix = "nibas-frontend"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}


provider "vault" {
  address         = "https://vault.vault:8200"
  skip_tls_verify = true
}

locals {
  namespace = "nibas"
}

