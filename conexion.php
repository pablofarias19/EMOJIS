<?php
// Configuración de la base de datos
$host = "127.0.0.1";
$dbname = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Error en la conexión a la base de datos: " . $e->getMessage());
}
?>