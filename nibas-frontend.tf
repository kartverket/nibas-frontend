terraform {
  backend "gcs" {
    prefix  = "nibas-frontend"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

locals {
  namespace = "nibas"
}

variable "nibas_frontend_version" {}
variable "vault_addr" {}
variable "vault_skip_verify" {}
variable "GITHUB_TOKEN" {sensitive = true}

provider "vault" {
  address = var.vault_addr
  skip_tls_verify = var.vault_skip_verify
  auth_login {
    path = "auth/jwt-dev/login"
    method = "jwt"
    parameters = {
      role = "nibas-frontend-read-role"
      jwt = var.GITHUB_TOKEN
    }
  }
}

data "vault_generic_secret" "nibas-baat-bruker" {
  path = "nibas/nibas-frontend/baat-bruker"
}

data "vault_generic_secret" "matrikkelen-wfs-service" {
  path = "nibas/nibas-frontend/matrikkelen-wfs"
}

data "vault_generic_secret" "aut-idporten-service" {
  path = "nibas/nibas-frontend/aut-idporten"
}

resource "kubernetes_deployment" "nibas-frontend-deployment" {
  metadata {
    name      = "nibas-frontend"
    namespace = local.namespace
    labels = {
      "backstage.io/kubernetes-id" = "nibas"
    }
  }
  spec {
    replicas = 3
    selector {
      match_labels = {
        app = "nibas-frontend"
      }
    }
    template {
      metadata {
         
        annotations = {
          "prometheus.io/scrape" = "true"
          "seccomp.security.alpha.kubernetes.io/pod" = "runtime/default"
        }
        labels = {
          app = "nibas-frontend"
          "backstage.io/kubernetes-id" = "nibas"
        }
      }
      spec {
        image_pull_secrets {
            name="nibas-pull-token-atkv1-kes"
        }
        security_context {
          supplemental_groups = [199]
          fs_group = 199
        }
        container {
          image = "ghcr.io/kartverket/nibas-frontend:${var.nibas_frontend_version}"
          name  = "nibas-frontend"
          security_context {
            privileged                 = false # Normal priviliges
            allow_privilege_escalation = false # Prevent reqests for root priviliges
            read_only_root_filesystem  = true  # Prevent writing to system files
            run_as_user                = 199   # Run as an unpriviliged user
            run_as_group               = 199   # Run as an unpriviliged group
          }
          port {
            container_port = 8080
          }
          env {
            name  = "BAAT_USERNAME"
            value = data.vault_generic_secret.nibas-baat-bruker.data["username"]
          }
          env {
            name  = "BAAT_PASSWORD"
            value = data.vault_generic_secret.nibas-baat-bruker.data["password"]
          }
          env {
            name  = "MATRIKKELEN_WFS_CREDENTIALS"
            value = data.vault_generic_secret.matrikkelen-wfs-service.data["credentials"]
          }
          env {
            name  = "MATRIKKELEN_WFS_URL"
            value = data.vault_generic_secret.matrikkelen-wfs-service.data["url"]
          }
          env {
            name = "AUT-IDPORTEN-URL"
            value = data.vault_generic_secret.aut-idporten-service.data["url"]
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "nibas-frontend-service" {
  metadata {
    name      = "nibas-frontend"
    namespace = local.namespace
  }
  spec {
    selector = {
      app = "nibas-frontend"
    }
    port {
      protocol    = "TCP"
      port        = 80
      target_port = 8080
    }
    type     = "ClusterIP"
  }
}

resource "kubernetes_manifest" "istio-destination-rule" {
  manifest = yamldecode(file("${path.module}/kubernetes/destination-rule.yml"))
}

resource "kubernetes_manifest" "istio-gateway" {
  manifest = yamldecode(file("${path.module}/kubernetes/gateway.yml"))
}

resource "kubernetes_manifest" "istio-virtualservice" {
  manifest = yamldecode(file("${path.module}/kubernetes/virtualservice.yml"))
}

# resource "kubernetes_manifest" "baat-reverse-proxy" {
#   manifest = yamldecode(file("${path.module}/kubernetes/baat-geonorge-no.yaml"))
# }


# resource "kubernetes_manifest" "wms-reverse-proxy" {
#   manifest = yamldecode(file("${path.module}/kubernetes/wms-geonorge-no.yaml"))
# }