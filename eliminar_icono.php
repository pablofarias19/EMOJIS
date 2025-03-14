<?php
// Configuración de la conexión a la base de datos
$servidor = "localhost";
$usuario = "u580580751_pablo";
$password = "Lucia1319$";
$base_datos = "u580580751_newsletter";

// Verificar si se proporcionó un ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "ID de icono no válido"]);
    exit;
}

$id = intval($_GET['id']);

// Crear conexión
$conn = new mysqli($servidor, $usuario, $password, $base_datos);

// Verificar la conexión
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Error en la conexión a la base de datos: " . $conn->connect_error]);
    exit;
}

// Establecer codificación UTF-8
$conn->set_charset("utf8mb4");

// Consulta para eliminar el icono
$sql = "DELETE FROM iconos_mapa WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

// Ejecutar y verificar resultado
if ($stmt->execute()) {
    header('Content-Type: application/json');
    echo json_encode(["success" => true]);
} else {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Error al eliminar el icono: " . $stmt->error]);
}

// Cerrar la conexión
$stmt->close();
$conn->close();
?>