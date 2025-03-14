<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['error' => 'Método no permitido']);
  exit;
}

// Obtener datos del formulario
$emoji_origen = isset($_POST['emoji_origen']) ? intval($_POST['emoji_origen']) : 0;
$emoji_destino = isset($_POST['emoji_destino']) ? intval($_POST['emoji_destino']) : 0;
$grupo_id = isset($_POST['grupo_id']) ? intval($_POST['grupo_id']) : 0;
$orden = isset($_POST['orden']) ? intval($_POST['orden']) : 0;
$etiqueta = isset($_POST['etiqueta']) ? $_POST['etiqueta'] : '';
$color = isset($_POST['color']) ? $_POST['color'] : '#4285F4';

// Validar datos
if ($emoji_origen <= 0 || $emoji_destino <= 0 || $grupo_id <= 0) {
  echo json_encode(['error' => 'IDs de emojis y grupo son obligatorios']);
  exit;
}

// Insertar nueva relación
$sql = "INSERT INTO relaciones_emoji_vinculos 
        (emoji_origen_id, emoji_destino_id, grupo_id, orden, etiqueta, color) 
        VALUES (?, ?, ?, ?, ?, ?)";

try {
  $stmt = $conn->prepare($sql);
  $stmt->execute([$emoji_origen, $emoji_destino, $grupo_id, $orden, $etiqueta, $color]);
  
  $relacion_id = $conn->lastInsertId();
  echo json_encode([
    'success' => true, 
    'id' => $relacion_id, 
    'mensaje' => 'Relación creada correctamente'
  ]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error al crear relación: ' . $e->getMessage()]);
}