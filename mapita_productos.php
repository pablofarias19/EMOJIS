<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración de la base de datos
$host = "127.0.0.1";
$dbname = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

try {
    // Conectar a la base de datos
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    // Establecemos el charset para manejar correctamente los emojis
    $conn->set_charset("utf8mb4");
    
    // Verificar si se ha solicitado un producto específico por ID
    $producto_id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if ($producto_id !== null) {
        // Si se proporcionó un ID, buscar solo ese producto
        $sql = "SELECT p.*, 
                COALESCE(
                    (SELECT i.imagen FROM imagenes_producto i WHERE i.producto_id = p.id LIMIT 1),
                    'sin_imagen.jpg'
                ) AS imagen
                FROM productos p
                WHERE p.activo = 1 AND p.id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $producto_id);
    } else {
        // Si no se proporcionó ID, continuar con la búsqueda normal
        // Obtener parámetros de búsqueda/filtrado
        $categoria = isset($_GET['categoria']) ? $conn->real_escape_string($_GET['categoria']) : null;
        $subcategoria = isset($_GET['subcategoria']) ? $conn->real_escape_string($_GET['subcategoria']) : null;
        $tipo_anuncio = isset($_GET['tipo']) ? $conn->real_escape_string($_GET['tipo']) : null; // oferta o demanda
        $busqueda = isset($_GET['q']) ? $conn->real_escape_string($_GET['q']) : null;
        
        // CORRECCIÓN: Adaptamos la consulta para usar la tabla productos en lugar de propiedades
        $sql = "SELECT p.*, 
                      COALESCE(
                        (SELECT i.imagen FROM imagenes_producto i WHERE i.producto_id = p.id LIMIT 1),
                        'sin_imagen.jpg'
                      ) AS imagen
               FROM productos p
               WHERE p.activo = 1";
        
        // Construir condiciones de filtrado
        $conditions = [];
        $params = [];
        
        // Adaptamos el filtrado para la estructura de la tabla productos
        if ($categoria !== null) {
            $conditions[] = "p.categoria = ?";
            $params[] = $categoria;
        }
        
        if ($subcategoria !== null) {
            $conditions[] = "p.subcategoria = ?";
            $params[] = $subcategoria;
        }
        
        if ($tipo_anuncio !== null) {
            $conditions[] = "p.tipo_anuncio = ?";
            $params[] = $tipo_anuncio;
        }
        
        if ($busqueda !== null) {
            $conditions[] = "(p.titulo LIKE ? OR p.descripcion_breve LIKE ? OR p.descripcion_detallada LIKE ? OR p.ubicacion LIKE ?)";
            $busquedaParam = "%{$busqueda}%";
            $params[] = $busquedaParam;
            $params[] = $busquedaParam;
            $params[] = $busquedaParam;
            $params[] = $busquedaParam;
        }
        
        // Agregar condiciones a la consulta SQL
        if (count($conditions) > 0) {
            $sql .= " AND " . implode(" AND ", $conditions);
        }
        
        // Ordenar resultados
        $sql .= " ORDER BY p.id DESC";
        
        // Preparar y ejecutar la consulta
        $stmt = $conn->prepare($sql);
        
        // Vincular parámetros si existen
        if (count($params) > 0) {
            $types = str_repeat("s", count($params)); // Todos los parámetros son strings
            $stmt->bind_param($types, ...$params);
        }
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Procesar resultados
    $productos = [];
    while ($row = $result->fetch_assoc()) {
        // Formatear el precio
        $precio_formateado = '$' . number_format($row['precio'], 2, ',', '.');
        
        // Crear array de producto
        $producto = [
            'id' => $row['id'],
            'titulo' => $row['titulo'],
            'precio' => $row['precio'],
            'precio_formateado' => $precio_formateado,
            'tipo' => $row['tipo_anuncio'],  // oferta o demanda
            'ubicacion' => $row['ubicacion'],
            'lat' => (float)$row['latitud'],
            'lng' => (float)$row['longitud'],
            'descripcion_breve' => $row['descripcion_breve'],
            'descripcion_detallada' => $row['descripcion_detallada'],
            'categoria' => $row['categoria'],
            'subcategoria' => $row['subcategoria'],
            'emoji' => $row['emoji'],
            'imagen' => $row['imagen'],
            'gif_url' => $row['gif_url'] ?? null,  // Nuevo campo para GIF
            'emoji_fallback' => $row['emoji_fallback'] ?? '📦',  // Emoji de respaldo
            'popup_html' => "<strong>{$row['emoji']} {$row['titulo']}</strong><br>" .
                           "Precio: {$precio_formateado}<br>" .
                           "Ubicación: {$row['ubicacion']}<br>" .
                           "<a href='#' onclick='mostrarDetalleProducto({$row['id']})'>Ver detalles</a>"
        ];
        
        $productos[] = $producto;
    }
    
    // Enviar la respuesta como JSON
    echo json_encode([
        'success' => true,
        'total' => count($productos),
        'productos' => $productos
    ]);
    
    // Cerrar la conexión
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    
    if (isset($conn)) {
        $conn->close();
    }
}
?>