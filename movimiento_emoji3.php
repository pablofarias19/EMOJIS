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
    die(json_encode(["error" => "Error en la conexión a la base de datos: " . $conn->connect_error]));
}

// Establecer codificación UTF-8
$conn->set_charset("utf8mb4");

// Obtener ID del icono si se proporciona
$iconoId = isset($_GET['id']) ? intval($_GET['id']) : null;

// Consulta SQL básica
$sql = "SELECT * FROM iconos_mapa WHERE activo = 1";

// Si se solicita un icono específico
if ($iconoId) {
    $sql .= " AND id = " . $iconoId;
}

// Ejecutar la consulta
$resultado = $conn->query($sql);

if (!$resultado) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(["error" => "Error en la consulta: " . $conn->error]));
}

// Preparar el array de respuesta
$iconos = [];

while ($fila = $resultado->fetch_assoc()) {
    // Formatear los datos para la respuesta
    $icono = [
        "id" => (int)$fila["id"],
        "emoji" => $fila["emoji"],
        "inicio" => [
            "lat" => (float)$fila["lat_inicial"],
            "lng" => (float)$fila["lng_inicial"]
        ],
        "fin" => [
            "lat" => (float)$fila["lat_final"],
            "lng" => (float)$fila["lng_final"]
        ],
        "velocidad" => (float)$fila["velocidad"],
        "titulo" => $fila["titulo"],
        "descripcion" => $fila["descripcion"],
        "mostrar_popup" => (int)$fila["mostrar_popup"],
        "popup" => (bool)$fila["mostrar_popup"]
    ];
    
    $iconos[] = $icono;
}

// Cerrar la conexión
$conn->close();

// Si no hay resultados, devolver un array vacío
if (count($iconos) === 0) {
    $iconos = [];
}

// Devolver los datos en formato JSON
header('Content-Type: application/json');

// Si solo se pidió un icono específico o si solo hay uno, devuelve objeto
if ($iconoId && count($iconos) === 1) {
    echo json_encode($iconos[0]);
} else {
    echo json_encode($iconos);
}
?>