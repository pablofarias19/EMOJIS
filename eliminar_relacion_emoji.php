<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Verificar el ID
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID de relación no válido']);
    exit;
}

try {
    $sql = "DELETE FROM relaciones_emoji_vinculos WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Relación eliminada correctamente']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . $e->getMessage()]);
}
?>