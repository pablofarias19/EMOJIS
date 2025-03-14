<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Opcional: filtrar por usuario
$usuario = isset($_GET['usuario']) ? $_GET['usuario'] : '';

$sql = "SELECT id, nombre, descripcion, criterio FROM grupos_emoji_vinculos";
if (!empty($usuario)) {
  $sql .= " WHERE creado_por = ?";
  $params = [$usuario];
}

try {
  $stmt = $conn->prepare($sql);
  if (!empty($usuario)) {
    $stmt->execute($params);
  } else {
    $stmt->execute();
  }
  $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  echo json_encode(['success' => true, 'grupos' => $grupos]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
}