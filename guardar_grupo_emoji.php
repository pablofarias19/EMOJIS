<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
$criterio = isset($_POST['criterio']) ? trim($_POST['criterio']) : '';
$color = isset($_POST['color']) ? $_POST['color'] : '#4285F4';
$creado_por = 'pablofarias19ok'; // Usuario fijo para este ejemplo

// Para depuración (opcional)
file_put_contents('grupo_debug.log', 
    date('Y-m-d H:i:s') . " - Datos recibidos:\n" .
    "ID: $id\n" .
    "Nombre: $nombre\n" .
    "Criterio: $criterio\n" .
    "Color: $color\n" .
    "--------------------\n",
    FILE_APPEND);

// Validar datos básicos
if (empty($nombre) || empty($criterio)) {
    echo json_encode(['success' => false, 'error' => 'Nombre y criterio son obligatorios']);
    exit;
}

try {
    if ($id > 0) {
        // Actualizar grupo existente
        $sql = "UPDATE grupos_emoji_vinculos 
                SET nombre = ?, descripcion = ?, criterio = ?, color = ? 
                WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([$nombre, $descripcion, $criterio, $color, $id]);
        
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Grupo actualizado correctamente']);
    } else {
        // Insertar nuevo grupo
        $sql = "INSERT INTO grupos_emoji_vinculos (nombre, descripcion, criterio, color, creado_por) 
                VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([$nombre, $descripcion, $criterio, $color, $creado_por]);
        
        $id = $conn->lastInsertId();
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Grupo creado correctamente']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al guardar: ' . $e->getMessage()]);
}
?>