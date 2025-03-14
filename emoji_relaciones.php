<?php
// Configuración para devolver JSON y permitir CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Obtener el ID del emoji del que queremos obtener relaciones
$id_emoji = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_emoji <= 0) {
    // Si no se proporciona un ID válido, devolver error
    echo json_encode([
        'error' => 'ID de emoji no válido',
        'status' => 'error'
    ]);
    exit;
}

// Configuración de la base de datos
$host = "127.0.0.1";
$dbname = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";


// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode([
        'error' => 'Error de conexión: ' . $conn->connect_error,
        'status' => 'error'
    ]);
    exit;
}

// Consulta adaptada para usar tu tabla existente relaciones_emoji_vinculos
$query = "SELECT 
            r.emoji_destino_id as id_emoji_relacionado,
            CASE 
                WHEN r.grupo_id = 1 THEN 'fuerte'
                ELSE 'debil'
            END as tipo,
            r.etiqueta,
            r.color,
            e.emoji as emoji_relacionado,
            e.titulo as titulo_relacionado
          FROM 
            relaciones_emoji_vinculos r
          LEFT JOIN 
            iconos_mapa e ON r.emoji_destino_id = e.id
          WHERE 
            r.emoji_origen_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id_emoji);
$stmt->execute();
$resultado = $stmt->get_result();

// Preparar respuesta
$respuesta = [
    'id_emoji' => $id_emoji,
    'relaciones' => []
];

// Procesar resultados
if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $respuesta['relaciones'][] = [
            'id_emoji_relacionado' => intval($row['id_emoji_relacionado']),
            'tipo' => $row['tipo'],
            'etiqueta' => $row['etiqueta'],
            'color' => $row['color'], // Añadimos el color directamente de la tabla
            'emoji_relacionado' => $row['emoji_relacionado'],
            'titulo_relacionado' => $row['titulo_relacionado']
        ];
    }
}

// Cerrar conexión
$stmt->close();
$conn->close();

// Devolver resultado
echo json_encode($respuesta);
?>

