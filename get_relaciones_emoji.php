<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $sql = "SELECT r.*, g.nombre as grupo_nombre, g.criterio, g.color as grupo_color,
                   o.emoji as emoji_origen, o.titulo as titulo_origen,
                   d.emoji as emoji_destino, d.titulo as titulo_destino
            FROM relaciones_emoji_vinculos r
            INNER JOIN grupos_emoji_vinculos g ON r.grupo_id = g.id
            INNER JOIN iconos_mapa o ON r.emoji_origen_id = o.id
            INNER JOIN iconos_mapa d ON r.emoji_destino_id = d.id
            ORDER BY r.grupo_id, r.orden";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $relaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'relaciones' => $relaciones]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $e->getMessage()]);
}
?>