<?php
header('Content-Type: text/html; charset=UTF-8');
require_once 'conexion.php';

echo "<h1>Añadir clave única a relaciones_emoji_vinculos</h1>";

try {
    // Verificar si la clave única ya existe
    $checkIndex = $conn->query("SHOW INDEX FROM relaciones_emoji_vinculos WHERE Key_name = 'rel_unique'");
    $indexExists = ($checkIndex->rowCount() > 0);
    
    if ($indexExists) {
        echo "<p>La clave única ya existe en la tabla.</p>";
    } else {
        // Añadir clave única
        $conn->exec("ALTER TABLE relaciones_emoji_vinculos ADD CONSTRAINT rel_unique UNIQUE (grupo_id, emoji_origen_id, emoji_destino_id)");
        echo "<p>Clave única añadida correctamente.</p>";
    }
    
    echo "<p><a href='simple_debug.php'>Volver a la página de prueba</a></p>";
} catch (PDOException $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>