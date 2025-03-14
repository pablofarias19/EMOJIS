<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $sql = "SELECT id, nombre, descripcion, criterio, color, creado_por, fecha_creacion 
            FROM grupos_emoji_vinculos 
            ORDER BY nombre ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'grupos' => $grupos]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $e->getMessage()]);
}
?>