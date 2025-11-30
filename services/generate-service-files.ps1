# Quick Service Files Generator
# Creates basic package.json, Dockerfile, .env.example, and index.js for all remaining services

$servicesConfig = @{
    "payment-service" = @{ Port = "3007"; DB = "payment_db"; MongoPort = "27021"; Desc = "Payment processing service"; Extra = '"stripe": "^14.9.0",' }
    "delivery-service" = @{ Port = "3008"; DB = "delivery_db"; MongoPort = "27022"; Desc = "Delivery management service"; Extra = "" }
    "driver-service" = @{ Port = "3009"; DB = "driver_db"; MongoPort = "27023"; Desc = "Driver management service"; Extra = "" }
    "notification-service" = @{ Port = "3010"; DB = "notification_db"; MongoPort = "27024"; Desc = "Notification service"; Extra = '"nodemailer": "^6.9.7", "twilio": "^4.19.0",' }
    "review-service" = @{ Port = "3011"; DB = "review_db"; MongoPort = "27025"; Desc = "Review and rating service"; Extra = "" }
    "analytics-service" = @{ Port = "3012"; DB = "analytics_db"; MongoPort = "27026"; Desc = "Analytics service"; Extra = "" }
    "chat-service" = @{ Port = "3013"; DB = "chat_db"; MongoPort = "27027"; Desc = "Chat service"; Extra = '"socket.io": "^4.6.0",' }
    "promotion-service" = @{ Port = "3014"; DB = "promotion_db"; MongoPort = "27028"; Desc = "Promotion service"; Extra = "" }
    "wishlist-service" = @{ Port = "3015"; DB = "wishlist_db"; MongoPort = "27029"; Desc = "Wishlist service"; Extra = "" }
    "dispute-service" = @{ Port = "3016"; DB = "dispute_db"; MongoPort = "27030"; Desc = "Dispute service"; Extra = "" }
    "audit-service" = @{ Port = "3017"; DB = "audit_db"; MongoPort = "27031"; Desc = "Audit logging service"; Extra = "" }
}

foreach ($serviceName in $servicesConfig.Keys) {
    $config = $servicesConfig[$serviceName]
    
    # Dockerfile
    $dockerfile = @"
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p logs
EXPOSE $($config.Port)
HEALTHCHECK CMD node -e "require('http').get('http://localhost:$($config.Port)/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "src/index.js"]
"@
    $dockerfile | Out-File -FilePath "$serviceName/Dockerfile" -Encoding UTF8
    
    # .env.example
    $env = @"
NODE_ENV=development
PORT=$($config.Port)
MONGODB_URI=mongodb://admin:admin123@mongo-$($serviceName.Replace("-service","")):27017/$($config.DB)?authSource=admin
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
"@
    $env | Out-File -FilePath "$serviceName/.env.example" -Encoding UTF8
    
    # src/index.js
    $index = @"
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const messageBroker = require('../../shared/utils/messageBroker');

const app = express();
const PORT = process.env.PORT || $($config.Port);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

messageBroker.connect().catch(console.error);

// TODO: Add routes here

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '$serviceName' });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log('$serviceName on port ' + PORT));
"@
    $index | Out-File -FilePath "$serviceName/src/index.js" -Encoding UTF8
    
    Write-Host "✓ Created files for $serviceName" -ForegroundColor Green
}

Write-Host "`n✨ All service files created successfully!" -ForegroundColor Cyan
