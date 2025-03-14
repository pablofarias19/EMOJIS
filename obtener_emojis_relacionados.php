<?php
// Habilitar depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once 'conexion.php';

// Recibir el ID del emoji origen
$emoji_id = isset($_GET['emoji_id']) ? intval($_GET['emoji_id']) : 0;
$grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : 0;

// Debug log
error_log("Buscando relaciones para emoji_id=$emoji_id, grupo_id=$grupo_id");

if (!$emoji_id) {
  echo json_encode(['success' => false, 'error' => 'ID de emoji no especificado']);
  exit;
}

try {
  // Consulta para relaciones
  $sql = "SELECT 
            r.id as relacion_id,
            r.emoji_origen_id,
            r.emoji_destino_id,
            r.grupo_id,
            r.orden,
            r.etiqueta,
            r.color,
            e.emoji,
            e.lat_inicial,
            e.lng_inicial,
            e.titulo,
            e.descripcion,
            g.nombre as nombre_grupo,
            g.criterio,
            g.color as grupo_color
          FROM 
            relaciones_emoji_vinculos r
            INNER JOIN iconos_mapa e ON r.emoji_destino_id = e.id
            INNER JOIN grupos_emoji_vinculos g ON r.grupo_id = g.id
          WHERE 
            r.emoji_origen_id = ?";

  if ($grupo_id) {
    $sql .= " AND r.grupo_id = ?";
    $params = [$emoji_id, $grupo_id];
  } else {
    $params = [$emoji_id];
  }

  $sql .= " ORDER BY r.grupo_id, r.orden ASC";
  
  $stmt = $conn->prepare($sql);
  $stmt->execute($params);
  $relacionados = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Log del resultado
  error_log("Encontrados ".count($relacionados)." emojis relacionados para emoji_id=$emoji_id");
  
  echo json_encode([
    'success' => true, 
    'relacionados' => $relacionados,
    'emoji_id' => $emoji_id,
    'total' => count($relacionados)
  ]);
  
} catch (PDOException $e) {
  error_log("Error en consulta: " . $e->getMessage());
  echo json_encode([
    'success' => false, 
    'error' => $e->getMessage()
  ]);
}
?>