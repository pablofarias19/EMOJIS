<?php
header('Content-Type: text/html; charset=UTF-8');
require_once 'conexion.php';

echo "<h1>Diagnóstico de Relaciones entre Emojis</h1>";

// 1. Verificar conexión a la base de datos
try {
    echo "<h2>1. Conexión a la base de datos</h2>";
    $testQuery = $conn->query("SELECT 1");
    echo "<p style='color:green'>✓ Conexión exitosa a la base de datos</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Error en la conexión: " . $e->getMessage() . "</p>";
    exit;
}

// 2. Verificar estructura de la tabla
try {
    echo "<h2>2. Estructura de la tabla relaciones_emoji_vinculos</h2>";
    $columnsQuery = $conn->query("SHOW COLUMNS FROM relaciones_emoji_vinculos");
    $columns = $columnsQuery->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Llave</th><th>Predeterminado</th></tr>";
    
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . $col['Field'] . "</td>";
        echo "<td>" . $col['Type'] . "</td>";
        echo "<td>" . $col['Null'] . "</td>";
        echo "<td>" . ($col['Key'] ?? '') . "</td>";
        echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Error al verificar estructura: " . $e->getMessage() . "</p>";
}

// 3. Intentar inserción de prueba
try {
    echo "<h2>3. Prueba de inserción</h2>";
    
    // Datos de prueba
    $testData = [
        'grupo_id' => 1,
        'emoji_origen_id' => 1,
        'emoji_destino_id' => 2, 
        'orden' => 999,
        'etiqueta' => 'PRUEBA ' . date('His'),
        'color' => '#FF0000'
    ];
    
    echo "<p>Intentando insertar:</p>";
    echo "<pre>" . print_r($testData, true) . "</pre>";
    
    // Primero verificar si ya existe
    $checkSql = "SELECT id FROM relaciones_emoji_vinculos 
                WHERE grupo_id = ? AND emoji_origen_id = ? AND emoji_destino_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$testData['grupo_id'], $testData['emoji_origen_id'], $testData['emoji_destino_id']]);
    
    if ($checkStmt->rowCount() > 0) {
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $relacionId = $row['id'];
        
        echo "<p>La relación ya existe con ID: {$relacionId}, actualizando...</p>";
        
        $updateSql = "UPDATE relaciones_emoji_vinculos
                      SET orden = ?, etiqueta = ?, color = ?
                      WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $result = $updateStmt->execute([
            $testData['orden'], 
            $testData['etiqueta'], 
            $testData['color'],
            $relacionId
        ]);
        
        if ($result) {
            echo "<p style='color:green'>✓ Actualización exitosa</p>";
        } else {
            echo "<p style='color:red'>✗ Error al actualizar: " . implode(", ", $updateStmt->errorInfo()) . "</p>";
        }
    } else {
        echo "<p>La relación no existe, insertando nueva...</p>";
        
        $insertSql = "INSERT INTO relaciones_emoji_vinculos 
                     (grupo_id, emoji_origen_id, emoji_destino_id, orden, etiqueta, color) 
                     VALUES (?, ?, ?, ?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $result = $insertStmt->execute([
            $testData['grupo_id'],
            $testData['emoji_origen_id'],
            $testData['emoji_destino_id'],
            $testData['orden'],
            $testData['etiqueta'],
            $testData['color']
        ]);
        
        if ($result) {
            $newId = $conn->lastInsertId();
            echo "<p style='color:green'>✓ Inserción exitosa con ID: {$newId}</p>";
        } else {
            echo "<p style='color:red'>✗ Error al insertar: " . implode(", ", $insertStmt->errorInfo()) . "</p>";
        }
    }
    
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Error en la prueba: " . $e->getMessage() . "</p>";
}

// 4. Mostrar algunas relaciones existentes
try {
    echo "<h2>4. Relaciones existentes (últimas 5)</h2>";
    
    $recentSql = "SELECT * FROM relaciones_emoji_vinculos ORDER BY id DESC LIMIT 5";
    $recentQuery = $conn->query($recentSql);
    $recentRelations = $recentQuery->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($recentRelations) > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Grupo</th><th>Origen</th><th>Destino</th><th>Orden</th><th>Etiqueta</th><th>Color</th></tr>";
        
        foreach ($recentRelations as $rel) {
            echo "<tr>";
            echo "<td>" . $rel['id'] . "</td>";
            echo "<td>" . $rel['grupo_id'] . "</td>";
            echo "<td>" . $rel['emoji_origen_id'] . "</td>";
            echo "<td>" . $rel['emoji_destino_id'] . "</td>";
            echo "<td>" . $rel['orden'] . "</td>";
            echo "<td>" . $rel['etiqueta'] . "</td>";
            echo "<td style='background-color:" . $rel['color'] . "'>" . $rel['color'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No hay relaciones en la tabla</p>";
    }
    
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Error al listar relaciones: " . $e->getMessage() . "</p>";
}

echo "<p><em>Diagnóstico completado " . date('Y-m-d H:i:s') . "</em></p>";
?>