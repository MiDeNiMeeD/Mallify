# Service Generator Script
# This script creates the basic structure for each microservice

# Service Configuration
$services = @(
    @{
        Name = "product-service"
        Port = "3003"
        Database = "product_db"
        MongoPort = "27019"
        Description = "Product catalog and inventory service"
    },
    @{
        Name = "order-service"
        Port = "3004"
        Database = "order_db"
        MongoPort = "27020"
        Description = "Order processing and cart service"
    },
    @{
        Name = "payment-service"
        Port = "3007"
        Database = "payment_db"
        MongoPort = "27021"
        Description = "Payment processing and subscription service"
    },
    @{
        Name = "delivery-service"
        Port = "3008"
        Database = "delivery_db"
        MongoPort = "27022"
        Description = "Delivery management and tracking service"
    },
    @{
        Name = "driver-service"
        Port = "3009"
        Database = "driver_db"
        MongoPort = "27023"
        Description = "Driver onboarding and management service"
    },
    @{
        Name = "notification-service"
        Port = "3010"
        Database = "notification_db"
        MongoPort = "27024"
        Description = "Notification service for email, SMS, and push"
    },
    @{
        Name = "review-service"
        Port = "3011"
        Database = "review_db"
        MongoPort = "27025"
        Description = "Review and rating service"
    },
    @{
        Name = "analytics-service"
        Port = "3012"
        Database = "analytics_db"
        MongoPort = "27026"
        Description = "Analytics and reporting service"
    },
    @{
        Name = "chat-service"
        Port = "3013"
        Database = "chat_db"
        MongoPort = "27027"
        Description = "Real-time chat service"
    },
    @{
        Name = "promotion-service"
        Port = "3014"
        Database = "promotion_db"
        MongoPort = "27028"
        Description = "Promotion and flash sale service"
    },
    @{
        Name = "wishlist-service"
        Port = "3015"
        Database = "wishlist_db"
        MongoPort = "27029"
        Description = "Wishlist and favorites service"
    },
    @{
        Name = "dispute-service"
        Port = "3016"
        Database = "dispute_db"
        MongoPort = "27030"
        Description = "Dispute resolution service"
    },
    @{
        Name = "audit-service"
        Port = "3017"
        Database = "audit_db"
        MongoPort = "27031"
        Description = "Audit logging service"
    }
)

Write-Host "🚀 Virtual Mall - Service Structure Generator" -ForegroundColor Cyan
Write-Host "=" * 50

foreach ($service in $services) {
    Write-Host "`nCreating $($service.Name)..." -ForegroundColor Green
    
    $servicePath = $service.Name
    
    # Create directory structure
    New-Item -ItemType Directory -Force -Path "$servicePath/src/models" | Out-Null
    New-Item -ItemType Directory -Force -Path "$servicePath/src/controllers" | Out-Null
    New-Item -ItemType Directory -Force -Path "$servicePath/src/routes" | Out-Null
    New-Item -ItemType Directory -Force -Path "$servicePath/src/middlewares" | Out-Null
    New-Item -ItemType Directory -Force -Path "$servicePath/logs" | Out-Null
    
    Write-Host "  ✓ Created directory structure" -ForegroundColor Gray
}

Write-Host "`n✨ Service structures created successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review and customize each service" -ForegroundColor Gray
Write-Host "  2. Copy .env.example to .env in each service" -ForegroundColor Gray
Write-Host "  3. Run: docker-compose up -d" -ForegroundColor Gray
Write-Host "  4. Install dependencies: npm install (in each service)" -ForegroundColor Gray
