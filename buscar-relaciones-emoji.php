<?php
/**
 * buscar_relaciones_emoji.php
 * 
 * Endpoint para búsqueda de emojis, grupos y relaciones
 * Permite buscar por palabras clave y filtrar por categorías
 */

// Configuración para devolver JSON y permitir CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Incluir conexión a la base de datos
require_once 'conexion.php';

// Obtener parámetros de búsqueda
$keyword = isset($_GET['keyword']) ? trim($_GET['keyword']) : '';
$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';         // emoji, grupo, relacion
$grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : 0;

// Validar que hay al menos una palabra clave o filtro
if (empty($keyword) && empty($tipo) && $grupo_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Debe proporcionar al menos un criterio de búsqueda'
    ]);
    exit;
}

try {
    $resultado = [];
    
    // 1. Buscar Emojis
    if (empty($tipo) || $tipo == 'emoji') {
        $sqlEmojis = "SELECT 
                e.id, 
                e.emoji, 
                e.titulo, 
                e.lat_inicial, 
                e.lng_inicial,
                e.descripcion,
                'emoji' as tipo
            FROM 
                iconos_mapa e
            WHERE 
                e.activo = 1 AND 
                (e.titulo LIKE :keyword OR e.descripcion LIKE :keyword OR e.emoji = :emoji)";
        
        // Si hay filtro de grupo, agregar condición
        if ($grupo_id > 0) {
            $sqlEmojis .= " AND EXISTS (
                SELECT 1 FROM relaciones_emoji_vinculos r 
                WHERE (r.emoji_origen_id = e.id OR r.emoji_destino_id = e.id) 
                AND r.grupo_id = :grupo_id
            )";
        }
        
        $stmt = $conn->prepare($sqlEmojis);
        $keywordParam = "%{$keyword}%";
        $stmt->bindParam(':keyword', $keywordParam, PDO::PARAM_STR);
        $stmt->bindParam(':emoji', $keyword, PDO::PARAM_STR);
        
        if ($grupo_id > 0) {
            $stmt->bindParam(':grupo_id', $grupo_id, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $emojis = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($emojis as $emoji) {
            $resultado[] = array_merge($emoji, ['type' => 'emoji']);
        }
    }
    
    // 2. Buscar Grupos
    if (empty($tipo) || $tipo == 'grupo') {
        $sqlGrupos = "SELECT 
                g.id, 
                g.nombre, 
                g.criterio, 
                g.descripcion, 
                g.color,
                'grupo' as tipo
            FROM 
                grupos_emoji_vinculos g
            WHERE 
                g.nombre LIKE :keyword OR 
                g.criterio LIKE :keyword OR 
                g.descripcion LIKE :keyword";
        
        $stmt = $conn->prepare($sqlGrupos);
        $keywordParam = "%{$keyword}%";
        $stmt->bindParam(':keyword', $keywordParam, PDO::PARAM_STR);
        $stmt->execute();
        $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($grupos as $grupo) {
            $resultado[] = array_merge($grupo, ['type' => 'grupo']);
        }
    }
    
    // 3. Buscar Relaciones
    if (empty($tipo) || $tipo == 'relacion') {
        $sqlRelaciones = "SELECT 
                r.id, 
                r.emoji_origen_id, 
                r.emoji_destino_id, 
                r.grupo_id, 
                r.etiqueta,
                o.emoji as emoji_origen,
                o.titulo as titulo_origen,
                d.emoji as emoji_destino,
                d.titulo as titulo_destino,
                g.nombre as nombre_grupo,
                'relacion' as tipo
            FROM 
                relaciones_emoji_vinculos r
                INNER JOIN iconos_mapa o ON r.emoji_origen_id = o.id
                INNER JOIN iconos_mapa d ON r.emoji_destino_id = d.id
                INNER JOIN grupos_emoji_vinculos g ON r.grupo_id = g.id
            WHERE 
                r.etiqueta LIKE :keyword OR
                o.titulo LIKE :keyword OR
                d.titulo LIKE :keyword OR
                g.nombre LIKE :keyword";
        
        // Si hay filtro de grupo, agregar condición
        if ($grupo_id > 0) {
            $sqlRelaciones .= " AND r.grupo_id = :grupo_id";
        }
        
        $stmt = $conn->prepare($sqlRelaciones);
        $keywordParam = "%{$keyword}%";
        $stmt->bindParam(':keyword', $keywordParam, PDO::PARAM_STR);
        
        if ($grupo_id > 0) {
            $stmt->bindParam(':grupo_id', $grupo_id, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $relaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($relaciones as $relacion) {
            $resultado[] = array_merge($relacion, ['type' => 'relacion']);
        }
    }
    
    // Devolver resultado como JSON
    echo json_encode([
        'success' => true,
        'query' => $keyword,
        'tipo' => $tipo,
        'grupo_id' => $grupo_id,
        'total' => count($resultado),
        'resultado' => $resultado
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en la consulta: ' . $e->getMessage()
    ]);
}
?>