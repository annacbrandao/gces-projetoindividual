variable "namespace" {
  description = "Namespace do Kubernetes para a aplicacao"
  type        = string
  default     = "mkjs"
}

variable "kube_context" {
  description = "Contexto do kubectl a ser usado"
  type        = string
  default     = "minikube"
}

variable "app_image" {
  description = "Imagem Docker da aplicacao"
  type        = string
  default     = "ghcr.io/annacbrandao/gces-projetoindividual-app:latest"
}

variable "nginx_image" {
  description = "Imagem Docker do Nginx"
  type        = string
  default     = "ghcr.io/annacbrandao/gces-projetoindividual-nginx:latest"
}
