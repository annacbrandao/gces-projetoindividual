output "namespace" {
  description = "Namespace criado"
  value       = kubernetes_namespace.mkjs.metadata[0].name
}
