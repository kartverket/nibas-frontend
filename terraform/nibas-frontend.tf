data "vault_generic_secret" "nibas-baat-bruker" {
  path = "nibas/nibas-frontend/baat-bruker"
}

data "vault_generic_secret" "matrikkelen-wfs-service" {
  path = "nibas/nibas-frontend/matrikkelen-wfs"
}

data "vault_generic_secret" "aut-idporten-service" {
  path = "nibas/nibas-frontend/aut-idporten"
}

resource "kubernetes_manifest" "nibas_frontend_application" {
  manifest = {
    apiVersion = "skiperator.kartverket.no/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = "nibas-frontend"
      namespace = "nibas"
    }
    spec = {
      image = "ghcr.io/kartverket/nibas-frontend:${var.NIBAS_FRONTEND_VERSION}"
      port  = 8080

      ingresses = [var.EXTERNAL_DNS_HOSTNAME]
      replicas = {
        min                  = 3
        max                  = 3
        targetCpuUtilization = 80
      }


      env = [
        {
          name  = "BAAT_USERNAME"
          value = data.vault_generic_secret.nibas-baat-bruker.data["username"]
        },
        {
          name  = "BAAT_PASSWORD"
          value = data.vault_generic_secret.nibas-baat-bruker.data["password"]
        },
        {
          name  = "MATRIKKELEN_WFS_CREDENTIALS"
          value = data.vault_generic_secret.matrikkelen-wfs-service.data["credentials"]
        },
        {
          name  = "MATRIKKELEN_WFS_URL"
          value = data.vault_generic_secret.matrikkelen-wfs-service.data["url"]
        },
        {
          name  = "AUT-IDPORTEN-URL"
          value = data.vault_generic_secret.aut-idporten-service.data["url"]
        }
      ]
      strategy = { type = "RollingUpdate" }

      # Liveness probes define a resource that returns 200 OK when the app is running
      # as intended. Returning a non-200 code will make kubernetes restart the app.
      # Liveness is optional, but when provided path and port is required
      liveness = {
        path             = "/"
        port             = 8080
        failureThreshold = 3
        timeout          = 1
        initialDelay     = 60
      }

      readiness = {
        path = "/"
        port = 8080
      }

      resources = {
        limits = {
          cpu    = "1000m"
          memory = "1G"
        }
        requests = {
          cpu    = "10m"
          memory = "500M"
        }
      }

      accessPolicy = {
        outbound = {
          rules = [
            {
              application = "aut-idporten"
              namespace   = "aut"
            }
          ]

          external = [
            {
              host = "prodtest.matrikkel.no"
            },
            {
              host = "baat.geonorge.no"
            },
            {
              host = "wms.geonorge.no"
            }
          ]
        }

      }
    }
  }
}
