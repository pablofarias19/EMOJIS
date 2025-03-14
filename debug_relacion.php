<?php
header('Content-Type: application/json');

// Registrar todos los datos de la solicitud
$debug_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'post_data' => $_POST,
    'raw_input' => file_get_contents('php://input'),
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'No Content-Type header'
];

// Guardar en un archivo de log
file_put_contents('debug_relacion.log', 
    json_encode($debug_info, JSON_PRETTY_PRINT) . "\n---------\n", 
    FILE_APPEND);

// Responder con éxito para pruebas
echo json_encode([
    'success' => true,
    'debug' => $debug_info,
    'message' => 'Datos recibidos para diagnóstico'
]);
?>