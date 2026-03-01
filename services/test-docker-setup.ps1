# Mallify Docker Test Script
# Run this script to test and validate the Docker setup

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Mallify Docker Setup Test Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the services directory
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found" -ForegroundColor Red
    Write-Host "Please run this script from the services/ directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found docker-compose.yml" -ForegroundColor Green
Write-Host ""

# Test 1: Check Docker is running
Write-Host "[Test 1] Checking Docker installation..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Validate docker-compose configuration
Write-Host "[Test 2] Validating docker-compose.yml..." -ForegroundColor Yellow
$configTest = docker-compose config --quiet 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Configuration is valid" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration has errors:" -ForegroundColor Red
    Write-Host $configTest
    exit 1
}
Write-Host ""

# Test 3: Check .env file
Write-Host "[Test 3] Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("JWT_SECRET", "JWT_EXPIRES_IN", "MONGODB_URI")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  Warning: Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Required environment variables found" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "   Consider copying .env.example to .env" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Check Dockerfiles exist
Write-Host "[Test 4] Checking Dockerfiles..." -ForegroundColor Yellow
$services = @(
    "api-gateway", "user-service", "product-service", "boutique-service",
    "order-service", "payment-service", "delivery-service", "driver-service",
    "notification-service", "chat-service", "review-service", "promotion-service",
    "wishlist-service", "analytics-service", "audit-service", "dispute-service"
)

$missingDockerfiles = @()
foreach ($service in $services) {
    if (-not (Test-Path "$service/Dockerfile")) {
        $missingDockerfiles += $service
    }
}

if ($missingDockerfiles.Count -eq 0) {
    Write-Host "✓ All 16 service Dockerfiles exist" -ForegroundColor Green
} else {
    Write-Host "❌ Missing Dockerfiles for: $($missingDockerfiles -join ', ')" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check infrastructure services
Write-Host "[Test 5] Checking infrastructure services..." -ForegroundColor Yellow
$runningContainers = docker ps --format "{{.Names}}" 2>&1

$infraServices = @("mallify-mongodb", "mallify-redis", "mallify-rabbitmq")
$runningInfra = @()
$stoppedInfra = @()

foreach ($service in $infraServices) {
    if ($runningContainers -match $service) {
        $runningInfra += $service
    } else {
        $stoppedInfra += $service
    }
}

if ($runningInfra.Count -gt 0) {
    Write-Host "✓ Running infrastructure: $($runningInfra -join ', ')" -ForegroundColor Green
}
if ($stoppedInfra.Count -gt 0) {
    Write-Host "⚠️  Stopped infrastructure: $($stoppedInfra -join ', ')" -ForegroundColor Yellow
}

if ($stoppedInfra.Count -eq 3) {
    Write-Host "   Run: docker-compose up -d mongodb redis rabbitmq" -ForegroundColor Cyan
}
Write-Host ""

# Test 6: Check application services
Write-Host "[Test 6] Checking application services..." -ForegroundColor Yellow
$appRunning = 0
foreach ($service in $services) {
    if ($runningContainers -match "mallify-$service") {
        $appRunning++
    }
}

if ($appRunning -gt 0) {
    Write-Host "✓ Running application services: $appRunning/16" -ForegroundColor Green
} else {
    Write-Host "ℹ  No application services running yet" -ForegroundColor Cyan
    Write-Host "   Run: docker-compose up -d" -ForegroundColor Cyan
}
Write-Host ""

# Test 7: Check for built images
Write-Host "[Test 7] Checking built images..." -ForegroundColor Yellow
$images = docker images --format "{{.Repository}}" | Select-String "services" -Quiet
if ($images) {
    $imageCount = (docker images --format "{{.Repository}}" | Select-String "services").Count
    Write-Host "✓ Found $imageCount service images" -ForegroundColor Green
} else {
    Write-Host "ℹ  No service images built yet" -ForegroundColor Cyan
    Write-Host "   Run: docker-compose build" -ForegroundColor Cyan
}
Write-Host ""

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($missingDockerfiles.Count -eq 0 -and $LASTEXITCODE -eq 0) {
    Write-Host "✅ Setup Status: READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Start infrastructure: docker-compose up -d mongodb redis rabbitmq" -ForegroundColor White
    Write-Host "  2. Build services: docker-compose build" -ForegroundColor White
    Write-Host "  3. Start all services: docker-compose up -d" -ForegroundColor White
    Write-Host "  4. View logs: docker-compose logs -f" -ForegroundColor White
} else {
    Write-Host "⚠️  Setup Status: NEEDS ATTENTION" -ForegroundColor Yellow
    Write-Host "Please review the errors above and fix them before proceeding." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For detailed documentation, see DOCKER_SETUP.md" -ForegroundColor Cyan
Write-Host ""
