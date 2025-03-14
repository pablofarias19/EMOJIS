<?php
/********************************************
 * 1. CONEXIÓN A LA BASE DE DATOS
 ********************************************/
$host     = "127.0.0.1";
$dbname   = "u580580751_newsletter";
$username = "u580580751_pablo";
$password = "Lucia1319$";

$conexion = new mysqli($host, $username, $password, $dbname);
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

/********************************************
 * 2. OBTENER ID POR GET
 ********************************************/
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    // Si no viene ID o no es numérico, muestra un mensaje y termina
    echo "No se ha especificado un ID válido.";
    exit;
}
$idProducto = (int)$_GET['id'];

/********************************************
 * 3. CONSULTAR EN LA TABLA
 ********************************************/
// Ajusta el nombre de la tabla y campos si difieren
$sql = "SELECT telefono, celular, email 
        FROM productos
        WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $idProducto);
$stmt->execute();
$resultado = $stmt->get_result();

$popupHTML = "";

/********************************************
 * 4. ARMAR EL HTML DE RESPUESTA
 ********************************************/
if ($resultado && $resultado->num_rows > 0) {
    $row = $resultado->fetch_assoc();
    
    $telefono = $row['telefono']; // Campo "telefono" (fijo o algo)
    $celular  = $row['celular'];
    $email    = $row['email'];

    // WhatsApp: si hay celular, limpiamos solo dígitos
    $whatsappLink = "";
    if (!empty($celular)) {
        $celularSoloDigitos = preg_replace('/\D+/', '', $celular);
        // Añade un texto inicial opcional, por ejemplo:
        $whatsappLink = "https://wa.me/$celularSoloDigitos?text=" . 
                        urlencode("Hola! Me interesa tu producto con ID $idProducto");
    }

    // Enlace para email
    $mailToLink = "";
    if (!empty($email)) {
        $mailToLink = "mailto:$email?subject=" . 
                      urlencode("Consulta sobre el producto #$idProducto") .
                      "&body="   .
                      urlencode("Hola, me gustaría saber más sobre tu producto...");
    }

    // Construimos un HTML básico con los datos disponibles
    // Ajusta estilos y etiquetas según tu gusto.
  // Construimos un HTML mejorado con los datos disponibles
$popupHTML = "
<div style='font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border-radius: 8px;'>
  <h2 style='text-align: center; color: #4CAF50;'>Datos de Contacto</h2>
  
  <!-- Teléfono fijo -->
  <div style='margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;'>
    <strong>Teléfono:</strong> 
    " . (!empty($telefono) ? $telefono : "<span style='color: #999;'>No disponible</span>") . "
  </div>

  <!-- Celular + enlace WhatsApp -->
  <div style='margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;'>
    <strong>Celular:</strong> 
    " . (!empty($celular) ? $celular : "<span style='color: #999;'>No disponible</span>") . "
    " . (!empty($whatsappLink) ? "
    <div style='margin-top: 10px;'>
      <a href='$whatsappLink' target='_blank' style='display: flex; align-items: center; justify-content: center; background-color: #25D366; color: white; text-decoration: none; padding: 10px; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'>
        <img src='https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' alt='WhatsApp' style='height: 20px; margin-right: 8px;'>
        Contactar por WhatsApp
      </a>
    </div>" : "") . "
  </div>

  <!-- Correo + enlace mailto -->
  <div style='margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;'>
    <strong>Email:</strong> 
    " . (!empty($email) ? $email : "<span style='color: #999;'>No disponible</span>") . "
    " . (!empty($mailToLink) ? "
    <div style='margin-top: 10px;'>
      <a href='$mailToLink' style='display: flex; align-items: center; justify-content: center; background-color: #0078D4; color: white; text-decoration: none; padding: 10px; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'>
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='white' style='margin-right: 8px;'><path d='M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z'/></svg>
        Enviar correo
      </a>
    </div>" : "") . "
  </div>

  <div style='text-align: center; margin-top: 20px;'>
    <button onclick='cerrarPopup()' style='background-color: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'>
      Cerrar
    </button>
  </div>
</div>";
} else {
    // No se encontró el producto o no hay datos
    $popupHTML = "<p>No se encontraron datos de contacto para este producto (ID: $idProducto).</p>";
}

/********************************************
 * 5. CERRAR CONEXIÓN Y ENVIAR HTML
 ********************************************/
$stmt->close();
$conexion->close();

// Retornamos el HTML al cliente (JS lo inyectará en un popup)
echo $popupHTML;
?>
