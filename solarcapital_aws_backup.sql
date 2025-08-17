/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.29-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: solarcapital
-- ------------------------------------------------------
-- Server version	10.5.29-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_transfer_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `date` datetime(6) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `from_user_id` bigint(20) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `to_user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdajeoeiefr1dntod4e3he4lx` (`from_user_id`),
  KEY `FK3iph9h50iaf00bqmx9t4gnang` (`project_id`),
  KEY `FKrqsa5x55sax3yysn8sf4e8iyk` (`to_user_id`),
  CONSTRAINT `FK3iph9h50iaf00bqmx9t4gnang` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKdajeoeiefr1dntod4e3he4lx` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKrqsa5x55sax3yysn8sf4e8iyk` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_transfer_log`
--

LOCK TABLES `credit_transfer_log` WRITE;
/*!40000 ALTER TABLE `credit_transfer_log` DISABLE KEYS */;
INSERT INTO `credit_transfer_log` VALUES (1,1000.00,'2025-08-09 21:37:01.000000','Funds added by user','ADD_FUNDS',NULL,NULL,1),(2,30000.00,'2025-08-09 21:47:17.000000','Funds added by user','ADD_FUNDS',NULL,NULL,1),(3,15000.00,'2025-08-09 21:49:04.000000','Investment in Rooftop Initiative','SUBSCRIPTION',1,2,NULL),(4,1000.00,'2025-08-09 21:51:18.000000','Withdrawal processed. Ref: CF1754776278494','WITHDRAWAL',1,NULL,NULL),(5,9000.00,'2025-08-09 21:52:22.000000','Withdrawal processed. Ref: CF1754776342209','WITHDRAWAL',1,NULL,NULL),(6,1000.00,'2025-08-09 21:52:44.000000','Reinvested in project Rooftop Initiative','REINVEST',1,2,NULL),(7,1000.00,'2025-08-09 21:53:03.000000','Donated to project Solar Farm ','DONATE',1,1,NULL),(8,1000.00,'2025-08-09 21:53:48.000000','Gift transaction between gunisha5april@gmail.com and 2022a1r112@mietjammu.in','GIFT',1,NULL,3),(9,15000.00,'2025-08-10 09:52:07.000000','Funds added by user','ADD_FUNDS',NULL,NULL,3),(10,1000.00,'2025-08-10 09:55:28.000000','Withdrawal processed. Ref: CF1754819728524','WITHDRAWAL',3,NULL,NULL),(11,1000.00,'2025-08-10 09:55:57.000000','Gift transaction between 2022a1r112@mietjammu.in and gunisha5april@gmail.com','GIFT',3,NULL,1),(12,12000.00,'2025-08-10 09:56:55.000000','Investment in Agri-Solar','SUBSCRIPTION',3,5,NULL),(13,10000.00,'2025-08-10 09:57:35.000000','Funds added by user','ADD_FUNDS',NULL,NULL,1),(14,12000.00,'2025-08-10 09:58:12.000000','Investment in Agri-Solar','SUBSCRIPTION',1,5,NULL);
/*!40000 ALTER TABLE `credit_transfer_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc`
--

DROP TABLE IF EXISTS `kyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `document_path` varchar(255) DEFAULT NULL,
  `pan` varchar(255) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4kqle3erx63vys4h9a7cym00m` (`user_id`),
  CONSTRAINT `FK670ssa8i9pr4idg4vh7q0dq7c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc`
--

LOCK TABLES `kyc` WRITE;
/*!40000 ALTER TABLE `kyc` DISABLE KEYS */;
INSERT INTO `kyc` VALUES (1,'Business Analytics specialization.pdf','hu37r2y9ihu','APPROVED',1),(2,'Machine Learning Algorithms with R in Business.pdf','yt67tygfv','APPROVED',3);
/*!40000 ALTER TABLE `kyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `energy_capacity` double DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subscription_price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,100,'Rajasthan','Solar Farm ','ACTIVE',40000.00),(2,80,'Gujarat','Rooftop Initiative','ACTIVE',15000.00),(3,200,'Karnataka','Wind-Solar Hybrid','PAUSED',65000.00),(4,110,'Tamil Nadu','Floating Solar','ACTIVE',25000.00),(5,70,'Maharashtra','Agri-Solar','ACTIVE',12000.00),(6,150,'Haryana','Solar Park','PAUSED',30000.00);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_history`
--

DROP TABLE IF EXISTS `reward_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `k_wh` double NOT NULL,
  `month` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reward_amount` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `year` int(11) NOT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeq39sn4g236ilpdxrfupxlaqk` (`project_id`),
  KEY `FKa34bhibj5sqq6uogx39o2bkut` (`user_id`),
  CONSTRAINT `FKa34bhibj5sqq6uogx39o2bkut` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKeq39sn4g236ilpdxrfupxlaqk` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_history`
--

LOCK TABLES `reward_history` WRITE;
/*!40000 ALTER TABLE `reward_history` DISABLE KEYS */;
INSERT INTO `reward_history` VALUES (1,100,8,'Energy production reward for Rooftop Initiative',1000.00,'SUCCESS',2025,2,1),(2,500,8,'Energy production reward for Agri-Solar',5000.00,'SUCCESS',2025,5,3),(3,500,8,'Energy production reward for Agri-Solar',5000.00,'SUCCESS',2025,5,1);
/*!40000 ALTER TABLE `reward_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `payment_order_id` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `subscribed_at` datetime(6) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK389gxlf063tlfj6s63qq1bjav` (`project_id`),
  KEY `FK8l1goo02px4ye49xd7wgogxg6` (`user_id`),
  CONSTRAINT `FK389gxlf063tlfj6s63qq1bjav` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FK8l1goo02px4ye49xd7wgogxg6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES (1,'CF_ORDER_1754776060323','FAILED','2025-08-09 21:47:40.000000',1,1),(2,'CF_ORDER_1754776113475','SUCCESS','2025-08-09 21:49:04.000000',2,1),(3,'CF_ORDER_1754819800656','SUCCESS','2025-08-10 09:56:55.000000',5,3),(4,'CF_ORDER_1754819883105','SUCCESS','2025-08-10 09:58:12.000000',5,1);
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(255) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnpsxm1erd0lbetjn5d3ayrsof` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,'MONTHLY_WITHDRAWAL_CAP','10000','Monthly withdrawal limit for users');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `is_verified` bit(1) NOT NULL,
  `kyc_status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `otp` varchar(255) DEFAULT NULL,
  `otp_generated_time` bigint(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','USER') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'8803129063','gunisha5april@gmail.com','gunisha aggarwal','','APPROVED','519160',1754767744727,'$2a$10$4DNbtBepurmaX2ZOWfhEK.3QUrcYNuUZerea0HCh9aYM4I9gHHC.q','USER'),(3,'8803129063','2022a1r112@mietjammu.in','tine','','APPROVED',NULL,NULL,'$2a$10$mu456C8VkZwYRc5.qpGotuTyICWo2eK/nIJPusCdw9lywlmZQcgs2','USER'),(5,'9999999999','admin@solarcapital.com','System Administrator','','APPROVED',NULL,NULL,'$2a$10$99GEcvgeYlahUzO7xrnwY.YtYn9iaBd0mTxAEj6qP1SIRHCx5MZI6','ADMIN');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawal_request`
--

DROP TABLE IF EXISTS `withdrawal_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawal_request` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `admin_notes` varchar(255) DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `bank_account_number` varchar(255) DEFAULT NULL,
  `ifsc_code` varchar(255) DEFAULT NULL,
  `payment_reference_id` varchar(255) DEFAULT NULL,
  `payout_method` varchar(255) DEFAULT NULL,
  `request_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2rqiplk9jndg5sa3yrb4lq9tj` (`user_id`),
  CONSTRAINT `FK2rqiplk9jndg5sa3yrb4lq9tj` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_request`
--

LOCK TABLES `withdrawal_request` WRITE;
/*!40000 ALTER TABLE `withdrawal_request` DISABLE KEYS */;
INSERT INTO `withdrawal_request` VALUES (1,NULL,1000.00,NULL,NULL,'CF1754776278494','UPI','2025-08-09 21:51:18.000000','PAID','user@upi',1),(2,NULL,9000.00,NULL,NULL,'CF1754776342209','UPI','2025-08-09 21:52:22.000000','PAID','user@upi',1),(3,NULL,1000.00,NULL,NULL,'CF1754819728524','UPI','2025-08-10 09:55:28.000000','PAID','user@upi',3);
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

-- Dump completed on 2025-08-12 10:32:12
