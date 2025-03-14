<?php
// Establecer cabecera para respuesta JSON
header('Content-Type: application/json');

// Incluir archivo de conexión a la base de datos
require_once 'conexion.php';

try {
    // Obtener datos del formulario
    $grupo_id = isset($_POST['grupo_id']) ? intval($_POST['grupo_id']) : 0;
    $emoji_origen_id = isset($_POST['emoji_origen_id']) ? intval($_POST['emoji_origen_id']) : 0;
    $emoji_destino_id = isset($_POST['emoji_destino_id']) ? intval($_POST['emoji_destino_id']) : 0;
    $orden = isset($_POST['orden']) ? intval($_POST['orden']) : 0;
    $etiqueta = isset($_POST['etiqueta']) ? trim($_POST['etiqueta']) : '';
    $color = isset($_POST['color']) ? trim($_POST['color']) : '#4285F4';
    $bidirectional = isset($_POST['bidirectional']) && $_POST['bidirectional'] == '1';
    
    // Validación básica
    if ($grupo_id <= 0 || $emoji_origen_id <= 0 || $emoji_destino_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        exit;
    }
    
    // Iniciar transacción
    $conn->beginTransaction();
    
    // Verificar si ya existe la relación
    $sqlVerificar = "SELECT id FROM relaciones_emoji_vinculos 
                     WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
    $stmtVerificar = $conn->prepare($sqlVerificar);
    $stmtVerificar->execute([$grupo_id, $emoji_origen_id, $emoji_destino_id]);
    
    if ($stmtVerificar->rowCount() > 0) {
        // Ya existe, actualizarla
        $sqlUpdate = "UPDATE relaciones_emoji_vinculos 
                      SET orden = ?, etiqueta = ?, color = ? 
                      WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
        $stmtUpdate = $conn->prepare($sqlUpdate);
        $stmtUpdate->execute([$orden, $etiqueta, $color, $grupo_id, $emoji_origen_id, $emoji_destino_id]);
    } else {
        // Insertar nueva relación
        $sqlInsert = "INSERT INTO relaciones_emoji_vinculos 
                     (grupo_id, emoji_origen_id, emoji_destino_id, orden, etiqueta, color) 
                     VALUES (?, ?, ?, ?, ?, ?)";
        $stmtInsert = $conn->prepare($sqlInsert);
        $stmtInsert->execute([$grupo_id, $emoji_origen_id, $emoji_destino_id, $orden, $etiqueta, $color]);
    }
    
    // Si es bidireccional, crear/actualizar la relación inversa
    if ($bidirectional) {
        // Verificar si ya existe la relación inversa
        $sqlVerificarInversa = "SELECT id FROM relaciones_emoji_vinculos 
                               WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
        $stmtVerificarInversa = $conn->prepare($sqlVerificarInversa);
        $stmtVerificarInversa->execute([$grupo_id, $emoji_destino_id, $emoji_origen_id]);
        
        if ($stmtVerificarInversa->rowCount() > 0) {
            // Ya existe, actualizarla
            $sqlUpdateInversa = "UPDATE relaciones_emoji_vinculos 
                                SET orden = ?, etiqueta = ?, color = ? 
                                WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
            $stmtUpdateInversa = $conn->prepare($sqlUpdateInversa);
            $stmtUpdateInversa->execute([$orden, $etiqueta, $color, $grupo_id, $emoji_destino_id, $emoji_origen_id]);
        } else {
            // Insertar nueva relación inversa
            $sqlInsertInversa = "INSERT INTO relaciones_emoji_vinculos 
                                (grupo_id, emoji_origen_id, emoji_destino_id, orden, etiqueta, color) 
                                VALUES (?, ?, ?, ?, ?, ?)";
            $stmtInsertInversa = $conn->prepare($sqlInsertInversa);
            $stmtInsertInversa->execute([$grupo_id, $emoji_destino_id, $emoji_origen_id, $orden, $etiqueta, $color]);
        }
    }
    
    // Confirmar transacción
    $conn->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => $bidirectional ? 'Relaciones bidireccionales creadas correctamente' : 'Relación creada correctamente'
    ]);
    
} catch (PDOException $e) {
    // Deshacer cambios en caso de error
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false, 
        'error' => 'Error de base de datos: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>