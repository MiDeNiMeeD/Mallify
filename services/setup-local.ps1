# Local Development Startup Script (Without Docker)
# This allows you to run services locally without Docker

Write-Host "🚀 Virtual Mall - Local Development Setup" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Prerequisites for Local Development:" -ForegroundColor Yellow
Write-Host "  You need to install and run these services manually:"
Write-Host "  1. MongoDB   - https://www.mongodb.com/try/download/community"
Write-Host "  2. RabbitMQ  - https://www.rabbitmq.com/download.html"
Write-Host "  3. Redis     - https://redis.io/download"
Write-Host ""

Write-Host "🎯 Recommended: Install Docker Desktop instead" -ForegroundColor Cyan
Write-Host "  Download from: https://www.docker.com/products/docker-desktop"
Write-Host "  Docker provides easy setup with one command!"
Write-Host ""

$response = Read-Host "Do you want to install dependencies for all services? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "📦 Installing dependencies for all services..." -ForegroundColor Cyan
    
    $services = @(
        "api-gateway",
        "user-service",
        "boutique-service",
        "product-service",
        "order-service",
        "payment-service",
        "delivery-service"
    )
    
    foreach ($service in $services) {
        if (Test-Path $service) {
            Write-Host ""
            Write-Host "Installing $service..." -ForegroundColor Yellow
            Push-Location $service
            npm install
            Pop-Location
            Write-Host "✓ $service dependencies installed" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "✨ All dependencies installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Make sure MongoDB, RabbitMQ, and Redis are running"
    Write-Host "  2. Update .env files in each service with local connection strings"
    Write-Host "  3. Start each service:"
    Write-Host "     cd user-service"
    Write-Host "     npm start"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Setup cancelled. Please install Docker Desktop for easier setup!" -ForegroundColor Yellow
}
