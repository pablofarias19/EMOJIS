<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Registrar todos los datos recibidos
$log = date('Y-m-d H:i:s') . " - SOLICITUD RECIBIDA\n";
$log .= "POST: " . print_r($_POST, true) . "\n";

try {
    // Obtener datos del formulario
    $grupo_id = isset($_POST['grupo_id']) ? intval($_POST['grupo_id']) : 0;
    $emoji_origen_id = isset($_POST['emoji_origen_id']) ? intval($_POST['emoji_origen_id']) : 0;
    $emoji_destino_id = isset($_POST['emoji_destino_id']) ? intval($_POST['emoji_destino_id']) : 0;
    $orden = isset($_POST['orden']) ? intval($_POST['orden']) : 0;
    $etiqueta = isset($_POST['etiqueta']) ? trim($_POST['etiqueta']) : '';
    $bidirectional = isset($_POST['bidirectional']) && $_POST['bidirectional'] == '1';
    
    // Por defecto, usar el color azul de Google
    $color = '#4285F4';
    
    // Intentar obtener el color del grupo seleccionado
    $stmt = $conn->prepare("SELECT color FROM grupos_emoji_vinculos WHERE id = ?");
    $stmt->execute([$grupo_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && isset($row['color'])) {
        $color = $row['color'];
    }
    
    $log .= "Usando color: $color\n";
    
    // 1. INSERTAR/ACTUALIZAR RELACIÓN PRINCIPAL
    $checkSql = "SELECT id FROM relaciones_emoji_vinculos 
                WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$grupo_id, $emoji_origen_id, $emoji_destino_id]);
    
    if ($checkStmt->rowCount() > 0) {
        // La relación ya existe, actualizarla
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $id = $row['id'];
        
        $updateSql = "UPDATE relaciones_emoji_vinculos 
                     SET orden = ?, etiqueta = ?, color = ? 
                     WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->execute([$orden, $etiqueta, $color, $id]);
        
        $log .= "Relación actualizada con ID: $id\n";
    } else {
        // Insertar nueva relación
        $insertSql = "INSERT INTO relaciones_emoji_vinculos 
                     (grupo_id, emoji_origen_id, emoji_destino_id, orden, etiqueta, color) 
                     VALUES (?, ?, ?, ?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->execute([$grupo_id, $emoji_origen_id, $emoji_destino_id, $orden, $etiqueta, $color]);
        
        $newId = $conn->lastInsertId();
        $log .= "Nueva relación creada con ID: $newId\n";
    }
    
    // 2. SI ES BIDIRECCIONAL, HACER LO MISMO CON LA RELACIÓN INVERSA
    if ($bidirectional) {
        $checkInvSql = "SELECT id FROM relaciones_emoji_vinculos 
                      WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
        $checkInvStmt = $conn->prepare($checkInvSql);
        $checkInvStmt->execute([$grupo_id, $emoji_destino_id, $emoji_origen_id]);
        
        if ($checkInvStmt->rowCount() > 0) {
            // La relación inversa ya existe, actualizarla
            $row = $checkInvStmt->fetch(PDO::FETCH_ASSOC);
            $invId = $row['id'];
            
            $updateInvSql = "UPDATE relaciones_emoji_vinculos 
                           SET orden = ?, etiqueta = ?, color = ? 
                           WHERE id = ?";
            $updateInvStmt = $conn->prepare($updateInvSql);
            $updateInvStmt->execute([$orden, $etiqueta, $color, $invId]);
            
            $log .= "Relación inversa actualizada con ID: $invId\n";
        } else {
            // Insertar nueva relación inversa
            $insertInvSql = "INSERT INTO relaciones_emoji_vinculos 
                           (grupo_id, emoji_origen_id, emoji_destino_id, orden, etiqueta, color) 
                           VALUES (?, ?, ?, ?, ?, ?)";
            $insertInvStmt = $conn->prepare($insertInvSql);
            $insertInvStmt->execute([$grupo_id, $emoji_destino_id, $emoji_origen_id, $orden, $etiqueta, $color]);
            
            $newInvId = $conn->lastInsertId();
            $log .= "Nueva relación inversa creada con ID: $newInvId\n";
        }
    }
    
    // Guardar el log y devolver respuesta exitosa
    file_put_contents('relacion_log.txt', $log, FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => $bidirectional ? 'Relaciones bidireccionales creadas correctamente' : 'Relación creada correctamente'
    ]);
    
} catch (PDOException $e) {
    $log .= "ERROR: " . $e->getMessage() . "\n";
    file_put_contents('relacion_log.txt', $log, FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar la relación: ' . $e->getMessage()
    ]);
}
?>