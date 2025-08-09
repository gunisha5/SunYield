-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: solarcapital
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `credit_transfer_log`
--

DROP TABLE IF EXISTS `credit_transfer_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_transfer_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `date` datetime(6) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `from_user_id` bigint DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `to_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdajeoeiefr1dntod4e3he4lx` (`from_user_id`),
  KEY `FK3iph9h50iaf00bqmx9t4gnang` (`project_id`),
  KEY `FKrqsa5x55sax3yysn8sf4e8iyk` (`to_user_id`),
  CONSTRAINT `FK3iph9h50iaf00bqmx9t4gnang` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKdajeoeiefr1dntod4e3he4lx` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKrqsa5x55sax3yysn8sf4e8iyk` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_transfer_log`
--

LOCK TABLES `credit_transfer_log` WRITE;
/*!40000 ALTER TABLE `credit_transfer_log` DISABLE KEYS */;
INSERT INTO `credit_transfer_log` VALUES (1,30000.00,'2025-08-07 10:29:40.982204','Investment in Silicon Valley','SUBSCRIPTION',1,7,NULL),(2,30000.00,'2025-08-07 10:31:01.299289','Funds added by user','ADD_FUNDS',NULL,NULL,1),(3,45000.00,'2025-08-07 10:31:58.504577','Funds added by user','ADD_FUNDS',NULL,NULL,1),(4,40000.00,'2025-08-07 10:32:40.287812','Investment in Sunrise Field','SUBSCRIPTION',1,2,NULL),(5,1000.00,'2025-08-07 10:40:32.289326','Funds added by user','ADD_FUNDS',NULL,NULL,1),(6,1000.00,'2025-08-07 10:47:16.276830','Withdrawal of Rs. 1000','WITHDRAWAL',1,NULL,NULL),(7,1000.00,'2025-08-07 10:47:19.136191','Withdrawal of Rs. 1000','WITHDRAWAL',1,NULL,NULL),(8,1000.00,'2025-08-07 10:54:18.895549','Withdrawal processed. Ref: CF1754564058840','WITHDRAWAL',1,NULL,NULL),(9,1000.00,'2025-08-07 11:05:56.866682','Funds added by user','ADD_FUNDS',NULL,NULL,1),(10,1000.00,'2025-08-07 11:12:38.255635','Funds added by user','ADD_FUNDS',NULL,NULL,1),(11,1000.00,'2025-08-07 11:12:41.017664','Funds added by user','ADD_FUNDS',NULL,NULL,1),(12,1000.00,'2025-08-07 11:13:56.454463','Withdrawal processed. Ref: CF1754565236454','WITHDRAWAL',1,NULL,NULL),(13,500.00,'2025-08-07 15:31:47.423880','Withdrawal processed. Ref: CF1754580707365','WITHDRAWAL',1,NULL,NULL),(14,500.00,'2025-08-07 15:31:56.157797','Withdrawal processed. Ref: CF1754580716157','WITHDRAWAL',1,NULL,NULL),(15,100.00,'2025-08-07 15:35:58.837949','Withdrawal processed. Ref: CF1754580958828','WITHDRAWAL',1,NULL,NULL),(16,100.00,'2025-08-07 15:36:00.895911','Withdrawal processed. Ref: CF1754580960880','WITHDRAWAL',1,NULL,NULL),(17,1000.00,'2025-08-07 15:59:16.344107','Reinvested in project Solar Park Alpha','REINVEST',1,1,NULL),(18,500.00,'2025-08-07 16:02:24.188342','Donated to project Solar Park Alpha','DONATE',1,1,NULL),(22,100.00,'2025-08-07 16:23:05.462439','Gifted to 2022a1r112@mietjammu.in','GIFT',1,NULL,3),(23,100.00,'2025-08-07 16:24:08.838509','Gifted to gunisha5april@gmail.com','GIFT',3,NULL,1),(24,300.00,'2025-08-07 16:51:51.264279','Gift transaction between gunisha5april@gmail.com and 2022a1r112@mietjammu.in','GIFT',1,NULL,3),(25,100.00,'2025-08-07 16:52:30.243042','Gift transaction between 2022a1r112@mietjammu.in and gunisha5april@gmail.com','GIFT',3,NULL,1),(26,31000.00,'2025-08-07 17:21:54.376582','Funds added by user','ADD_FUNDS',NULL,NULL,3),(27,30000.00,'2025-08-07 17:23:46.627500','Investment in Silicon Valley','SUBSCRIPTION',3,7,NULL);
/*!40000 ALTER TABLE `credit_transfer_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc`
--

DROP TABLE IF EXISTS `kyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `document_path` varchar(255) DEFAULT NULL,
  `pan` varchar(255) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4kqle3erx63vys4h9a7cym00m` (`user_id`),
  CONSTRAINT `FK670ssa8i9pr4idg4vh7q0dq7c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc`
--

LOCK TABLES `kyc` WRITE;
/*!40000 ALTER TABLE `kyc` DISABLE KEYS */;
INSERT INTO `kyc` VALUES (1,'Introduction to Applied Business Analytics.pdf','R1RE51F','APPROVED',1),(2,'Introduction to Business Analytics.pdf','162526','APPROVED',3);
/*!40000 ALTER TABLE `kyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `energy_capacity` double DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subscription_price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,100,'Lagos, Nigeria','Solar Park Alpha','ACTIVE',40000.00),(2,75,'Abuja, Nigeria','Sunrise Field','ACTIVE',40000.00),(3,120,'Kano, Nigeria','Desert Light','PAUSED',60000.00),(4,90,'Ibadan, Nigeria','Green Valley','ACTIVE',45000.00),(5,110,'Port Harcourt, Nigeria','Eco Sun Project','ACTIVE',55000.00),(7,100,'India','Silicon Valley','ACTIVE',30000.00);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_history`
--

DROP TABLE IF EXISTS `reward_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `k_wh` double NOT NULL,
  `month` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reward_amount` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `year` int NOT NULL,
  `project_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeq39sn4g236ilpdxrfupxlaqk` (`project_id`),
  KEY `FKa34bhibj5sqq6uogx39o2bkut` (`user_id`),
  CONSTRAINT `FKa34bhibj5sqq6uogx39o2bkut` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKeq39sn4g236ilpdxrfupxlaqk` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_history`
--

LOCK TABLES `reward_history` WRITE;
/*!40000 ALTER TABLE `reward_history` DISABLE KEYS */;
INSERT INTO `reward_history` VALUES (1,100,8,'Energy production reward for Solar Park Alpha',1000.00,'SUCCESS',2025,1,1),(2,300,8,'Energy production reward for Silicon Valley',3000.00,'SUCCESS',2025,7,1),(3,300,8,'Energy production reward for Silicon Valley',3000.00,'SUCCESS',2025,7,3);
/*!40000 ALTER TABLE `reward_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_order_id` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `subscribed_at` datetime(6) DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK389gxlf063tlfj6s63qq1bjav` (`project_id`),
  KEY `FK8l1goo02px4ye49xd7wgogxg6` (`user_id`),
  CONSTRAINT `FK389gxlf063tlfj6s63qq1bjav` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FK8l1goo02px4ye49xd7wgogxg6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES (1,'CF_ORDER_1754561461886','SUCCESS','2025-08-07 10:22:47.327584',1,1),(2,'CF_ORDER_1754562554560','SUCCESS','2025-08-07 10:29:40.965513',7,1),(3,'CF_ORDER_1754562728166','SUCCESS','2025-08-07 10:32:40.279775',2,1),(4,'CF_ORDER_1754587250005','SUCCESS','2025-08-07 17:23:46.614289',7,3),(5,'CF_ORDER_1754587330520','FAILED','2025-08-07 17:22:10.520465',7,3),(6,'CF_ORDER_1754587362525','FAILED','2025-08-07 17:22:42.525524',7,3);
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_key` varchar(255) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnpsxm1erd0lbetjn5d3ayrsof` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,'MONTHLY_WITHDRAWAL_CAP','7000','Monthly withdrawal limit for users');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `is_verified` bit(1) NOT NULL,
  `kyc_status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `otp` varchar(255) DEFAULT NULL,
  `otp_generated_time` bigint DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'8803129063','gunisha5april@gmail.com','gunisha aggarwal',_binary '','APPROVED',NULL,NULL,'$2a$10$2xlmBB28EJyJ4hnUKYyy2.uIiAmDmP1OvXDV3b6Gx5P0DApdin0Xi','USER'),(2,'1234567890','admin@solarcapital.com','Admin User',_binary '','APPROVED',NULL,NULL,'$2a$10$99GEcvgeYlahUzO7xrnwY.YtYn9iaBd0mTxAEj6qP1SIRHCx5MZI6','ADMIN'),(3,'8803129063','2022a1r112@mietjammu.in','Tina',_binary '','APPROVED',NULL,NULL,'$2a$10$4ZVJ4btKdd.BfIHuFQSX/ueK31qboiuq/fjj2nJCaTjNISGFaUbRC','USER');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawal_request`
--

DROP TABLE IF EXISTS `withdrawal_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawal_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_notes` varchar(255) DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `bank_account_number` varchar(255) DEFAULT NULL,
  `ifsc_code` varchar(255) DEFAULT NULL,
  `payment_reference_id` varchar(255) DEFAULT NULL,
  `payout_method` varchar(255) DEFAULT NULL,
  `request_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2rqiplk9jndg5sa3yrb4lq9tj` (`user_id`),
  CONSTRAINT `FK2rqiplk9jndg5sa3yrb4lq9tj` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_request`
--

LOCK TABLES `withdrawal_request` WRITE;
/*!40000 ALTER TABLE `withdrawal_request` DISABLE KEYS */;
INSERT INTO `withdrawal_request` VALUES (1,NULL,1000.00,NULL,NULL,'CF1754563636248','UPI','2025-08-07 10:47:16.204922','PAID','user@upi',1),(2,NULL,1000.00,NULL,NULL,'CF1754563639136','UPI','2025-08-07 10:47:19.120179','PAID','user@upi',1),(3,NULL,1000.00,NULL,NULL,'CF1754564058840','UPI','2025-08-07 10:54:18.840045','PAID','user@upi',1),(4,NULL,1000.00,NULL,NULL,'CF1754565236454','UPI','2025-08-07 11:13:56.454463','PAID','user@upi',1),(5,NULL,500.00,NULL,NULL,'CF1754580707365','UPI','2025-08-07 15:31:47.365719','PAID','user@upi',1),(6,NULL,500.00,NULL,NULL,'CF1754580716157','UPI','2025-08-07 15:31:56.157797','PAID','user@upi',1),(7,NULL,100.00,NULL,NULL,'CF1754580958828','UPI','2025-08-07 15:35:58.828645','PAID','user@upi',1),(8,NULL,100.00,NULL,NULL,'CF1754580960880','UPI','2025-08-07 15:36:00.880043','PAID','user@upi',1);
/*!40000 ALTER TABLE `withdrawal_request` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-10  0:48:54
