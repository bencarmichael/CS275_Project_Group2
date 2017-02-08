-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cookbook
-- ------------------------------------------------------
-- Server version	5.7.17-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `recipe`
--

DROP TABLE IF EXISTS `recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL,
  `instructions` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe`
--

LOCK TABLES `recipe` WRITE;
/*!40000 ALTER TABLE `recipe` DISABLE KEYS */;
INSERT INTO `recipe` VALUES (1,'Boiled Egg','A single boiled egg','Add egg to cold water. Bring water to boil. Cook.'),(2,'Chocolate Cake','Yummy cake','Add eggs, flour, chocolate to pan. Bake at 350 for 1 hour.'),(3,'Chocolate Milk','A delicious beverage','Combine milk, chocolate syrup, and stir well.'),(4,'Ice Cream Sundae','A frozen treat','Scoop Ice Cream into bowl, add chocolate syrup and sprinkles.'),(5,'Ham Sandwich','A deli classic','Spead mayonaise onto two slices of bread, insert ham and cheese between the slices of bread.'),(6,'Tacos','A Mexican dish','Cook ground beef until brown, then add black beans, diced tomatoes, and hot sauce. Once heated through, pour mixture onto tortilla and wrap.'),(7,'Cheeseburgers','An American classic','Form ground beef into patties, and grill to your preference. Add sliced american cheese, top with ketchup, and serve on a toasted bun.'),(8,'French Fries','A fried treat','Slice potatoes into thin strips, and soak in water for one hour. Drain, and fry in cooking oil, add salt and pepper to preference and top with ketchup.'),(9,'Tuna Sandwich','A deli classic','Combine tuna and mayonaise in a bowl, and mix well. Serve on toasted bread.'),(10,'Milkshake','A frozen treat','Combine ice cream, milk, vanilla extract, and chocolate syrup in a blender, and blend well.');
/*!40000 ALTER TABLE `recipe` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-08 14:05:52
