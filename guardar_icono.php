<?php
/********************************************
 * 1. CONEXIÓN A LA BASE DE DATOS
 ********************************************/
$host     = "127.0.0.1";
$dbname   = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

// Activar registro de errores para facilitar depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Crear conexión - NOTA: La variable es $conexion
$conexion = new mysqli($host, $username, $password, $dbname);
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Establecer codificación UTF-8 para soportar emojis
$conexion->set_charset("utf8mb4");

// Obtener y validar datos del POST
$id = isset($_POST['id']) && !empty($_POST['id']) ? intval($_POST['id']) : 0;
$emoji = isset($_POST['emoji']) && !empty($_POST['emoji']) ? $_POST['emoji'] : '📍';
$lat_inicial = isset($_POST['lat_inicial']) ? floatval($_POST['lat_inicial']) : 0;
$lng_inicial = isset($_POST['lng_inicial']) ? floatval($_POST['lng_inicial']) : 0;
$lat_final = isset($_POST['lat_final']) ? floatval($_POST['lat_final']) : 0;
$lng_final = isset($_POST['lng_final']) ? floatval($_POST['lng_final']) : 0;
$velocidad = isset($_POST['velocidad']) ? floatval($_POST['velocidad']) : 0.0003;
$titulo = isset($_POST['titulo']) ? $_POST['titulo'] : null;
$descripcion = isset($_POST['descripcion']) ? $_POST['descripcion'] : null;
$mostrar_popup = isset($_POST['mostrar_popup']) ? intval($_POST['mostrar_popup']) : 0;
$activo = isset($_POST['activo']) ? intval($_POST['activo']) : 1;

// Validaciones básicas
if ($lat_inicial == 0 || $lng_inicial == 0) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Coordenadas iniciales inválidas"]);
    exit;
}

if ($lat_final == 0 || $lng_final == 0) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Coordenadas finales inválidas"]);
    exit;
}

try {
    // Operación: UPDATE o INSERT
    if ($id > 0) {
        // UPDATE - actualizar un emoji existente
        $sql = "UPDATE iconos_mapa SET 
                emoji = ?, 
                lat_inicial = ?, 
                lng_inicial = ?, 
                lat_final = ?, 
                lng_final = ?, 
                velocidad = ?, 
                titulo = ?, 
                descripcion = ?, 
                mostrar_popup = ?, 
                activo = ? 
                WHERE id = ?";
                
        $stmt = $conexion->prepare($sql); // CORREGIDO: $conexion en lugar de $conn
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
        }
        
        $result = $stmt->bind_param(
            "sdddddssiii", 
            $emoji, 
            $lat_inicial, 
            $lng_inicial, 
            $lat_final, 
            $lng_final, 
            $velocidad, 
            $titulo, 
            $descripcion, 
            $mostrar_popup, 
            $activo, 
            $id
        );
        
        if (!$result) {
            throw new Exception("Error en bind_param: " . $stmt->error);
        }
    } else {
        // INSERT - agregar un nuevo emoji
        $sql = "INSERT INTO iconos_mapa 
                (emoji, lat_inicial, lng_inicial, lat_final, lng_final, velocidad, titulo, descripcion, mostrar_popup, activo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $conexion->prepare($sql); // CORREGIDO: $conexion en lugar de $conn
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
        }
        
        $result = $stmt->bind_param(
            "sdddddssii", 
            $emoji, 
            $lat_inicial, 
            $lng_inicial, 
            $lat_final, 
            $lng_final, 
            $velocidad, 
            $titulo, 
            $descripcion, 
            $mostrar_popup, 
            $activo
        );
        
        if (!$result) {
            throw new Exception("Error en bind_param: " . $stmt->error);
        }
    }

    // Ejecutar la consulta
    if ($stmt->execute()) {
        // Obtener el ID si es una inserción nueva
        $nuevo_id = $id > 0 ? $id : $conexion->insert_id; // CORREGIDO: $conexion en lugar de $conn
        header('Content-Type: application/json');
        echo json_encode(["success" => true, "id" => $nuevo_id]);
    } else {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

    // Cerrar la conexión
    $stmt->close();
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}

$conexion->close(); // CORREGIDO: $conexion en lugar de $conn
?>