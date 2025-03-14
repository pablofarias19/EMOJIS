<?php
// Configuración de la conexión a la base de datos
$host     = "127.0.0.1";
$dbname   = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

// Verificar si se proporcionó un ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(["error" => "ID de icono no válido"]);
    exit;
}

$id = intval($_GET['id']);

// Crear conexión
$conn = new mysqli($servidor, $usuario, $password, $base_datos);

// Verificar la conexión
if ($conn->connect_error) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Error en la conexión a la base de datos"]);
    exit;
}

// Establecer codificación UTF-8
$conn->set_charset("utf8mb4");

// Consulta SQL para obtener el icono específico
$sql = "SELECT * FROM iconos_mapa WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$resultado = $stmt->get_result();

if (!$resultado) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
    exit;
}

// Verificar si se encontró el icono
if ($resultado->num_rows === 0) {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(["error" => "Icono no encontrado"]);
    exit;
}

// Obtener los datos del icono
$icono = $resultado->fetch_assoc();

// Cerrar la conexión
$stmt->close();
$conn->close();

// Devolver los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($icono);
?>