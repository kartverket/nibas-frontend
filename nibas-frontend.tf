terraform {
  backend "gcs" {
    bucket  = "terraform-state-nibas-frontend"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

locals {
  namespace = "nibas"
}

variable "nibas_frontend_version" {}

resource "kubernetes_deployment" "nibas-frontend-deployment" {
  metadata {
    name      = "nibas-frontend"
    namespace = local.namespace
    labels = {
      "backstage.io/kubernetes-id" = "nibas"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "nibas-frontend"
      }
    }
    template {
      metadata {
         
        annotations = {
          "prometheus.io/scrape" = "true"
        }
        labels = {
          app = "nibas-frontend"
          "backstage.io/kubernetes-id" = "nibas"
        }
      }
      spec {
        image_pull_secrets {
            name="nibas-pull-token"
        }
        container {
          image = "ghcr.io/kartverket/nibas-frontend:${var.nibas_frontend_version}"
          name  = "nibas-frontend"
          port {
            container_port = 8080
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
  manifest = yamldecode(file("${path.module}/kubernetes/destination-rule.yaml"))
}

resource "kubernetes_manifest" "istio-gateway" {
  manifest = yamldecode(file("${path.module}/kubernetes/gateway.yaml"))
}

resource "kubernetes_manifest" "istio-virtualservice" {
  manifest = yamldecode(file("${path.module}/kubernetes/virtualservice.yaml"))
}