# 🌞 SunYield - Solar Investment Platform

A comprehensive solar energy investment platform that democratizes renewable energy investments, allowing users to invest in solar projects and earn monthly energy rewards.

![SunYield Logo](https://img.shields.io/badge/SunYield-Solar%20Investment-blue?style=for-the-badge&logo=sun)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?style=for-the-badge&logo=spring)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)

## 🚀 Features

### 💰 Investment Management
- **Solar Project Investment** - Invest in verified solar energy projects
- **Portfolio Tracking** - Monitor your investments and returns
- **Energy Rewards** - Earn monthly rewards based on energy generation
- **Flexible Contributions** - Choose between fixed and flexible investment options

### 💳 Financial Features
- **Digital Wallet** - Secure wallet system for managing funds
- **Payment Gateway** - Integrated payment processing with Cashfree
- **Withdrawal System** - Easy withdrawal to bank accounts
- **Transaction History** - Complete transaction tracking

### 🎁 Social Features
- **Gift System** - Send credits to other users
- **Donation Platform** - Donate to solar projects
- **Reinvestment** - Reinvest earnings into new projects
- **Referral System** - Earn through referrals

### 🔐 Security & Compliance
- **KYC Verification** - Complete identity verification
- **Admin Dashboard** - Comprehensive admin management
- **User Management** - Role-based access control
- **Audit Trails** - Complete transaction logging

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library

### Backend
- **Spring Boot 3.x** - Enterprise-grade Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **MySQL 8.0** - Reliable relational database
- **Maven** - Dependency management
- **Java 17** - Modern Java features

### Infrastructure
- **AWS EC2** - Cloud computing
- **AWS RDS** - Managed database service
- **Nginx** - Web server and reverse proxy
- **SSL/TLS** - Secure connections
- **Domain Management** - Custom domain support

## 📋 Prerequisites

- **Java 17+** - For Spring Boot backend
- **Node.js 18+** - For React frontend
- **MySQL 8.0+** - Database server
- **Maven 3.6+** - Build tool
- **Git** - Version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/gunisha5/SunYield.git
cd SunYield
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create database
mysql -u root -p
CREATE DATABASE sunyield;

# Update database configuration in application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/sunyield
# spring.datasource.username=root
# spring.datasource.password=yourpassword

# Run the application
./mvnw spring-boot:run
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Admin Panel**: http://localhost:3000/admin

## 📁 Project Structure

```
SunYield/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml            # Maven dependencies
├── frontend/               # React Frontend
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── uploads/               # User uploads
├── docs/                  # Documentation
└── README.md              # This file
```

## 🔧 Configuration

### Database Configuration
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sunyield
spring.datasource.username=root
spring.datasource.password=yourpassword
```

### Email Configuration
Configure SMTP settings for email notifications:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/forgot-password` - Password reset

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create new project (Admin)

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/history` - Get subscription history
- `GET /api/subscriptions/pending` - Get pending subscriptions (Admin)

### Wallet
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/add-funds` - Add funds to wallet
- `POST /api/wallet/withdraw` - Withdraw funds

### Engagement
- `POST /api/engagement/reinvest` - Reinvest earnings
- `POST /api/engagement/donate` - Donate to projects
- `POST /api/engagement/gift` - Send gifts to users

## 🗄️ Database Schema

### Core Entities
- **Users** - User accounts and profiles
- **Projects** - Solar energy projects
- **Subscriptions** - User project investments
- **RewardHistory** - Energy reward payments
- **CreditTransferLog** - Financial transactions
- **KYC** - Identity verification records
- **Coupons** - Discount and promotion codes

## 🚀 Deployment

### AWS Deployment
See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment Steps
1. **Set up AWS RDS MySQL database**
2. **Launch EC2 instance**
3. **Deploy backend and frontend**
4. **Configure domain and SSL**
5. **Set up monitoring and backups**

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - BCrypt password hashing
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Comprehensive data validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Cross-site scripting prevention

## 📊 Monitoring & Analytics

- **Application Logs** - Comprehensive logging system
- **Performance Metrics** - Application performance monitoring
- **User Analytics** - User behavior tracking
- **Financial Reports** - Investment and earnings reports
- **Admin Dashboard** - Real-time system monitoring

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Gunisha** - Full Stack Developer
- **Contributors** - Open source contributors

## 📞 Support

- **Email**: support@sunyield.com
- **Documentation**: [Project Wiki](https://github.com/gunisha5/SunYield/wiki)
- **Issues**: [GitHub Issues](https://github.com/gunisha5/SunYield/issues)

## 🎯 Roadmap

### Phase 1 ✅
- [x] User authentication and registration
- [x] Project investment system
- [x] Wallet and payment integration
- [x] Admin dashboard

### Phase 2 🚧
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Blockchain integration
- [ ] International expansion

### Phase 3 🔮
- [ ] AI-powered investment recommendations
- [ ] Carbon credit trading
- [ ] IoT integration for real-time monitoring
- [ ] Global solar project marketplace

## 🌟 Acknowledgments

- **Spring Boot Community** - For the amazing framework
- **React Team** - For the powerful frontend library
- **Tailwind CSS** - For the utility-first CSS framework
- **Open Source Community** - For all the amazing libraries

---

<div align="center">

**Made with ❤️ for a Sustainable Future**

[![GitHub stars](https://img.shields.io/github/stars/gunisha5/SunYield?style=social)](https://github.com/gunisha5/SunYield/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/gunisha5/SunYield?style=social)](https://github.com/gunisha5/SunYield/network)
[![GitHub issues](https://img.shields.io/github/issues/gunisha5/SunYield)](https://github.com/gunisha5/SunYield/issues)

</div>
#   S u n Y i e l d  
 