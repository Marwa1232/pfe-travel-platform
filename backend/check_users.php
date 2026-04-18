<?php
require 'vendor/autoload.php';
use Doctrine\DBAL\DriverManager;

$conn = DriverManager::getConnection([
    'driver' => 'pdo_mysql',
    'host' => 'localhost',
    'dbname' => 'trip_booking_db',
    'user' => 'root',
    'password' => '',
]);

$sql = "SELECT id, email, first_name, last_name FROM users LIMIT 5";
$stmt = $conn->executeQuery($sql);
while ($row = $stmt->fetchAssociative()) {
    echo "ID: " . $row['id'] . ", Email: " . $row['email'] . ", Name: " . $row['first_name'] . " " . $row['last_name'] . "\n";
}