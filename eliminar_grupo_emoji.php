<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Verificar el ID
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID de grupo no válido']);
    exit;
}

try {
    // Iniciar transacción
    $conn->beginTransaction();
    
    // Primero, eliminar todas las relaciones asociadas al grupo
    $sqlRelaciones = "DELETE FROM relaciones_emoji_vinculos WHERE grupo_id = ?";
    $stmtRelaciones = $conn->prepare($sqlRelaciones);
    $stmtRelaciones->execute([$id]);
    
    // Después, eliminar el grupo
    $sqlGrupo = "DELETE FROM grupos_emoji_vinculos WHERE id = ?";
    $stmtGrupo = $conn->prepare($sqlGrupo);
    $stmtGrupo->execute([$id]);
    
    // Confirmar transacción
    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'Grupo y sus relaciones eliminados correctamente']);
} catch (PDOException $e) {
    // Deshacer cambios si hay error
    $conn->rollBack();
    echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . $e->getMessage()]);
}
?>