<?php
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>Estado de las relaciones</h1>";

// 1. Mostrar datos POST
echo "<h2>1. Datos POST recibidos</h2>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<pre>" . print_r($_POST, true) . "</pre>";
    echo "<hr>";
}

// 2. Formulario de prueba
echo "<h2>2. Formulario de prueba</h2>";
echo '<form method="post" action="">';
echo '<p><label>Grupo ID: <input type="number" name="grupo_id" value="1"></label></p>';
echo '<p><label>Emoji Origen ID: <input type="number" name="emoji_origen_id" value="1"></label></p>';
echo '<p><label>Emoji Destino ID: <input type="number" name="emoji_destino_id" value="2"></label></p>';
echo '<p><label>Orden: <input type="number" name="orden" value="0"></label></p>';
echo '<p><label>Etiqueta: <input type="text" name="etiqueta" value="Test"></label></p>';
echo '<p><label>Color: <input type="color" name="color" value="#4285F4"></label></p>';
echo '<p><label><input type="checkbox" name="bidirectional" value="1"> Bidireccional</label></p>';
echo '<p><button type="submit">Probar guardar</button></p>';
echo '</form>';
echo "<hr>";

// 3. Mostrar relaciones existentes
echo "<h2>3. Relaciones existentes</h2>";
try {
    require_once 'conexion.php';
    
    $query = "SELECT * FROM relaciones_emoji_vinculos ORDER BY id DESC LIMIT 10";
    $stmt = $conn->query($query);
    $relaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($relaciones) > 0) {
        echo '<table border="1" cellpadding="5">';
        echo '<tr><th>ID</th><th>Grupo</th><th>Origen</th><th>Destino</th><th>Orden</th><th>Etiqueta</th><th>Color</th></tr>';
        
        foreach ($relaciones as $relacion) {
            echo '<tr>';
            echo '<td>' . $relacion['id'] . '</td>';
            echo '<td>' . $relacion['grupo_id'] . '</td>';
            echo '<td>' . $relacion['emoji_origen_id'] . '</td>';
            echo '<td>' . $relacion['emoji_destino_id'] . '</td>';
            echo '<td>' . $relacion['orden'] . '</td>';
            echo '<td>' . $relacion['etiqueta'] . '</td>';
            echo '<td style="background-color:' . $relacion['color'] . '">' . $relacion['color'] . '</td>';
            echo '</tr>';
        }
        echo '</table>';
    } else {
        echo '<p>No hay relaciones para mostrar.</p>';
    }
} catch (Exception $e) {
    echo '<p>Error al conectar a la base de datos: ' . $e->getMessage() . '</p>';
}
?>