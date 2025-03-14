<?php
/**
 * get_icono.php
 * 
 * Obtiene información detallada de un emoji específico por su ID
 */

header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener ID del emoji
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$id) {
  echo json_encode(['success' => false, 'error' => 'ID de emoji no especificado']);
  exit;
}

try {
  // Consulta para obtener el emoji
  $sql = "SELECT * FROM iconos_mapa WHERE id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->execute([$id]);
  $emoji = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$emoji) {
    echo json_encode(['success' => false, 'error' => 'Emoji no encontrado']);
    exit;
  }
  
  // Consulta para obtener el número de relaciones
  $sqlRelaciones = "SELECT COUNT(*) as total FROM relaciones_emoji_vinculos 
                    WHERE emoji_origen_id = ? OR emoji_destino_id = ?";
  $stmtRelaciones = $conn->prepare($sqlRelaciones);
  $stmtRelaciones->execute([$id, $id]);
  $totalRelaciones = $stmtRelaciones->fetch(PDO::FETCH_ASSOC)['total'];
  
  // Añadir el total de relaciones a la respuesta
  $emoji['total_relaciones'] = $totalRelaciones;
  
  echo json_encode([
    'success' => true,
    'emoji' => $emoji
  ]);
  
} catch (PDOException $e) {
  echo json_encode([
    'success' => false,
    'error' => 'Error en la consulta: ' . $e->getMessage()
  ]);
}
?>