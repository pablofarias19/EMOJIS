<?php
// Configuración de la conexión a la base de datos
$servidor = "localhost";
$usuario = "u580580751_pablo";
$password = "Lucia1319$";
$base_datos = "u580580751_newsletter";

// Crear conexión
$conn = new mysqli($servidor, $usuario, $password, $base_datos);

// Verificar la conexión
if ($conn->connect_error) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Error en la conexión a la base de datos: " . $conn->connect_error]);
    exit;
}

// Establecer codificación UTF-8
$conn->set_charset("utf8mb4");

// Consulta SQL para obtener todos los iconos
$sql = "SELECT * FROM iconos_mapa ORDER BY id DESC";
$resultado = $conn->query($sql);

if (!$resultado) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
    exit;
}

// Preparar el array de respuesta
$iconos = [];

while ($fila = $resultado->fetch_assoc()) {
    $iconos[] = $fila;
}

// Cerrar la conexión
$conn->close();

// Devolver los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($iconos);
?>