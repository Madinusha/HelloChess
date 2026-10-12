# Сначала запускаем Docker Desktop
# потом
#  .\deploy.ps1 start

param([string]$Action = "help")

$status = minikube status --format='{{.Host}}'
if ($status -ne 'Running') {
    Write-Host "Minikube не запущен. Запускаю..."
    minikube start
}

switch ($Action) {
    "start"   { minikube start }
    "deploy"  { kubectl apply -f k8s/ }
    "reset"   { kubectl delete -f k8s/ --ignore-not-found; kubectl apply -f k8s/ }
    "stop"    { minikube stop }
    "status"  { kubectl get all; kubectl get pvc }
    default   { Write-Host "Использование: .\deploy.ps1 [start|deploy|reset|stop|status]" }
}

#  kubectl get pods
#  minikube service hellochess