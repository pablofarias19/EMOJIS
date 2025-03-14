<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['error' => 'Método no permitido']);
  exit;
}

// Obtener datos del formulario
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$descripcion = isset($_POST['descripcion']) ? $_POST['descripcion'] : '';
$criterio = isset($_POST['criterio']) ? $_POST['criterio'] : '';
$creado_por = isset($_POST['creado_por']) ? $_POST['creado_por'] : 'pablofarias19ok';

// Validar datos
if (empty($nombre) || empty($criterio)) {
  echo json_encode(['error' => 'Nombre y criterio son obligatorios']);
  exit;
}

// Insertar nuevo grupo
$sql = "INSERT INTO grupos_emoji_vinculos (nombre, descripcion, criterio, creado_por) 
        VALUES (?, ?, ?, ?)";

try {
  $stmt = $conn->prepare($sql);
  $stmt->execute([$nombre, $descripcion, $criterio, $creado_por]);
  
  $grupo_id = $conn->lastInsertId();
  echo json_encode(['success' => true, 'id' => $grupo_id, 'mensaje' => 'Grupo creado correctamente']);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error al crear grupo: ' . $e->getMessage()]);
}