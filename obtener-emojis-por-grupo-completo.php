<?php
/**
 * obtener_emojis_por_grupo.php
 * 
 * Retorna todos los emojis que pertenecen a un grupo específico
 * Busca en las relaciones para encontrar emojis origen y destino
 */

header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener ID del grupo
$grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : 0;

if (!$grupo_id) {
  echo json_encode(['success' => false, 'error' => 'ID de grupo no especificado']);
  exit;
}

try {
  // Primero obtenemos información del grupo
  $sqlGrupo = "SELECT id, nombre, criterio, descripcion, color 
               FROM grupos_emoji_vinculos 
               WHERE id = ?";
  $stmtGrupo = $conn->prepare($sqlGrupo);
  $stmtGrupo->execute([$grupo_id]);
  $grupo = $stmtGrupo->fetch(PDO::FETCH_ASSOC);
  
  if (!$grupo) {
    echo json_encode(['success' => false, 'error' => 'Grupo no encontrado']);
    exit;
  }
  
  // Ahora obtenemos todos los emojis relacionados con este grupo
  $sqlEmojis = "SELECT DISTINCT e.* 
                FROM iconos_mapa e
                JOIN relaciones_emoji_vinculos r ON (e.id = r.emoji_origen_id OR e.id = r.emoji_destino_id)
                WHERE r.grupo_id = ? AND e.activo = 1
                ORDER BY e.id";
  
  $stmtEmojis = $conn->prepare($sqlEmojis);
  $stmtEmojis->execute([$grupo_id]);
  $emojis = $stmtEmojis->fetchAll(PDO::FETCH_ASSOC);
  
  // Obtenemos también las relaciones de este grupo
  $sqlRelaciones = "SELECT r.*, 
                    o.emoji as emoji_origen, o.titulo as titulo_origen,
                    o.lat_inicial as lat_origen, o.lng_inicial as lng_origen,
                    d.emoji as emoji_destino, d.titulo as titulo_destino,
                    d.lat_inicial as lat_destino, d.lng_inicial as lng_destino
                    FROM relaciones_emoji_vinculos r
                    JOIN iconos_mapa o ON r.emoji_origen_id = o.id
                    JOIN iconos_mapa d ON r.emoji_destino_id = d.id
                    WHERE r.grupo_id = ?
                    ORDER BY r.orden";
  
  $stmtRelaciones = $conn->prepare($sqlRelaciones);
  $stmtRelaciones->execute([$grupo_id]);
  $relaciones = $stmtRelaciones->fetchAll(PDO::FETCH_ASSOC);
  
  // Contar total de emojis y relaciones
  $totalEmojis = count($emojis);
  $totalRelaciones = count($relaciones);
  
  echo json_encode([
    'success' => true,
    'grupo' => $grupo,
    'emojis' => $emojis,
    'relaciones' => $relaciones,
    'total_emojis' => $totalEmojis,
    'total_relaciones' => $totalRelaciones
  ]);
  
} catch (PDOException $e) {
  echo json_encode([
    'success' => false,
    'error' => 'Error en la consulta: ' . $e->getMessage()
  ]);
}
?>