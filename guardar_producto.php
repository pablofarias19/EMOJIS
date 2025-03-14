<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// 1. OBTENER DATOS DEL FORMULARIO
$tipo_anuncio          = isset($_POST['tipo_anuncio']) ? trim($_POST['tipo_anuncio']) : '';
$categoria             = isset($_POST['categoria']) ? trim($_POST['categoria']) : '';
$subcategoria          = isset($_POST['subcategoria']) ? trim($_POST['subcategoria']) : '';
$emoji                 = isset($_POST['emoji']) ? trim($_POST['emoji']) : '';
$titulo                = isset($_POST['titulo']) ? trim($_POST['titulo']) : '';
$precio                = isset($_POST['precio']) ? (float)$_POST['precio'] : 0;
$descripcion_breve     = isset($_POST['descripcion_breve']) ? trim($_POST['descripcion_breve']) : '';
$descripcion_detallada = isset($_POST['descripcion_detallada']) ? trim($_POST['descripcion_detallada']) : '';
$ubicacion             = isset($_POST['ubicacion']) ? trim($_POST['ubicacion']) : '';
$latitud               = isset($_POST['latitud']) ? (float)$_POST['latitud'] : 0;
$longitud              = isset($_POST['longitud']) ? (float)$_POST['longitud'] : 0;

// NUEVO: Agregar campos de información de contacto
$telefono              = isset($_POST['telefono']) ? trim($_POST['telefono']) : null;
$celular               = isset($_POST['celular']) ? trim($_POST['celular']) : null;
$email                 = isset($_POST['email']) ? trim($_POST['email']) : null;

// 2. VALIDAR DATOS OBLIGATORIOS
if (empty($titulo) || empty($categoria) || empty($tipo_anuncio) || $latitud == 0 || $longitud == 0) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Faltan datos obligatorios']);
    exit;
}

// NUEVO: Validar que haya al menos un método de contacto
if (empty($telefono) && empty($celular) && empty($email)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Debe proporcionar al menos un medio de contacto (teléfono, celular o email)']);
    exit;
}

// 3. CONFIGURACIÓN DE BASE DE DATOS
$host     = "127.0.0.1";
$dbname   = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

try {
    // 4. CONEXIÓN A LA BASE DE DATOS
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    // (Opcional) Variables adicionales
    $fecha_publicacion = date('Y-m-d H:i:s');
    $activo            = 1;

    // 5. INSERTAR PRODUCTO
    $sql = "INSERT INTO productos (
                tipo_anuncio,
                categoria,
                subcategoria,
                emoji,
                titulo,
                precio,
                descripcion_breve,
                descripcion_detallada,
                ubicacion,
                latitud,
                longitud,
                telefono,
                celular,
                email,
                fecha_publicacion,
                activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparación del INSERT: " . $conn->error);
    }
    
    $stmt->bind_param(
        "sssssdsssddssssi",
        $tipo_anuncio,
        $categoria,
        $subcategoria,
        $emoji,
        $titulo,
        $precio,
        $descripcion_breve,
        $descripcion_detallada,
        $ubicacion,
        $latitud,
        $longitud,
        $telefono,
        $celular,
        $email,
        $fecha_publicacion,
        $activo
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error al guardar el producto: " . $stmt->error);
    }
    
    // Guardar ID del producto
    $producto_id = $conn->insert_id;
    $stmt->close();

    // 6. PROCESAR IMÁGENES
    $imagenes_procesadas = [];

    // Límite de 3 imágenes
    $max_imagenes = 3;
    // Tamaño máximo (1 MB = 1 * 1024 * 1024 bytes)
    $max_size_bytes = 1 * 1024 * 1024; 

    if (!empty($_FILES['imagenes']['name'][0])) {
        // Verificar cuántos archivos se subieron
        $total_archivos = count($_FILES['imagenes']['name']);
        
        // Si se suben más de 3, puedes elegir rechazar o tomar sólo los primeros 3
        if ($total_archivos > $max_imagenes) {
            // Opción A: Generar error y no guardar nada
            /*
            throw new Exception("Solo se permiten un máximo de 3 imágenes.");
            */
            
            // Opción B: Tomar sólo los primeros 3
            $total_archivos = $max_imagenes;
        }
        
        // Carpeta de destino
        $ruta_carpeta = "imagenes/productos/";
        if (!file_exists($ruta_carpeta)) {
            mkdir($ruta_carpeta, 0777, true);
        }
        
        // Preparar la consulta de inserción para la tabla de imágenes
        $sql_img = "INSERT INTO imagenes_producto (producto_id, imagen, es_principal) 
                    VALUES (?, ?, ?)";
        $stmt_img = $conn->prepare($sql_img);
        if (!$stmt_img) {
            throw new Exception("Error preparando el INSERT de imágenes: " . $conn->error);
        }
        
        // Recorrer los archivos hasta un máximo de $total_archivos
        for ($i = 0; $i < $total_archivos; $i++) {
            // Verificar que no haya error en la subida
            if ($_FILES['imagenes']['error'][$i] === 0) {
                // Verificar el tamaño máximo
                if ($_FILES['imagenes']['size'][$i] > $max_size_bytes) {
                    // Puedes descartar esta imagen o arrojar una excepción
                    // Opción A: descartar e informar
                    continue; 
                    // Opción B: throw new Exception("La imagen excede 1 MB de tamaño.");
                }

                // Nombre original y extensión
                $nombre_original = $_FILES['imagenes']['name'][$i];
                $extension       = pathinfo($nombre_original, PATHINFO_EXTENSION);
                
                // Generar un nombre único
                $nombre_imagen = uniqid('producto_' . $producto_id . '_') . '.' . $extension;
                $ruta_imagen   = $ruta_carpeta . $nombre_imagen;
                
                if (move_uploaded_file($_FILES['imagenes']['tmp_name'][$i], $ruta_imagen)) {
                    // Asignar la primera imagen como principal
                    $es_principal = ($i === 0) ? 1 : 0;
                    
                    // Insertar en la tabla "imagenes_producto"
                    $stmt_img->bind_param("isi", $producto_id, $nombre_imagen, $es_principal);
                    if ($stmt_img->execute()) {
                        $imagenes_procesadas[] = [
                            'imagen'       => $nombre_imagen,
                            'es_principal' => $es_principal,
                            'size_bytes'   => $_FILES['imagenes']['size'][$i]
                        ];
                    }
                }
            }
        }
        $stmt_img->close();
    }

    // 7. RESPUESTA EXITOSA
    $conn->close();
    
    // Enviamos respuesta JSON con datos extra para la página de éxito
    echo json_encode([
        'success' => true,
        'message' => 'Anuncio publicado exitosamente',
        'id'      => $producto_id,
        'imagenes'=> $imagenes_procesadas,
        'emoji'   => $emoji,
        'titulo'  => $titulo,
        'tipo_anuncio' => $tipo_anuncio
    ]);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}