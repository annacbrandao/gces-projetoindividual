terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.kube_context
}

resource "kubernetes_namespace" "mkjs" {
  metadata {
    name = var.namespace
  }
}
