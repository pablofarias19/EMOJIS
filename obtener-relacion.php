<?php
/**
 * obtener_relacion.php
 * 
 * Obtiene información detallada de una relación específica por su ID
 * Incluye datos de los emojis origen y destino, así como del grupo
 */

header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener ID de la relación
$relacion_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$relacion_id) {
  echo json_encode(['success' => false, 'error' => 'ID de relación no especificado']);
  exit;
}

try {
  // Consulta para obtener toda la información de la relación
  $sql = "SELECT 
            r.id, r.emoji_origen_id, r.emoji_destino_id, r.grupo_id, r.orden, r.etiqueta, r.color,
            g.nombre as nombre_grupo, g.criterio as criterio_grupo, g.color as color_grupo,
            o.emoji as emoji_origen, o.titulo as titulo_origen, o.descripcion as descripcion_origen,
            o.lat_inicial as lat_origen, o.lng_inicial as lng_origen,
            d.emoji as emoji_destino, d.titulo as titulo_destino, d.descripcion as descripcion_destino,
            d.lat_inicial as lat_destino, d.lng_inicial as lng_destino
          FROM 
            relaciones_emoji_vinculos r
            INNER JOIN grupos_emoji_vinculos g ON r.grupo_id = g.id
            INNER JOIN iconos_mapa o ON r.emoji_origen_id = o.id
            INNER JOIN iconos_mapa d ON r.emoji_destino_id = d.id
          WHERE r.id = ?";
  
  $stmt = $conn->prepare($sql);
  $stmt->execute([$relacion_id]);
  $relacion = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$relacion) {
    echo json_encode(['success' => false, 'error' => 'Relación no encontrada']);
    exit;
  }
  
  // Verificar si existe una relación inversa (bidireccional)
  $sqlBidirectional = "SELECT id FROM relaciones_emoji_vinculos 
                      WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
  $stmtBidirectional = $conn->prepare($sqlBidirectional);
  $stmtBidirectional->execute([
    $relacion['grupo_id'], 
    $relacion['emoji_destino_id'], 
    $relacion['emoji_origen_id']
  ]);
  
  $relacionInversa = $stmtBidirectional->fetch(PDO::FETCH_ASSOC);
  $esBidireccional = ($relacionInversa !== false);
  
  // Preparar respuesta con información completa
  $respuesta = [
    'success' => true,
    'relacion' => $relacion,
    'es_bidireccional' => $esBidireccional,
    'id_relacion_inversa' => $esBidireccional ? $relacionInversa['id'] : null
  ];
  
  echo json_encode($respuesta);
  
} catch (PDOException $e) {
  echo json_encode([
    'success' => false,
    'error' => 'Error en la consulta: ' . $e->getMessage()
  ]);
}
?>