<?php
// Simula datos de información para mostrar en el cuadro
$info = [
    "titulo" => "📍 Mapita",
    "descripcion" => "Es una comunidad que colabora, sin fines de lucro, y sirve para publicar ofertas y servicios.",
    "detalles" => 'Nadie puede publicar sin un email, se restringen palabras indebidas. Comentarios y consultas a pablofarias19@gmail.com.'
];

// Devuelve los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($info, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
