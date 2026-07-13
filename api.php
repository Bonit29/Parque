<?php
/**
 * ARCHIVO: api.php
 * UBICACIÓN LOCAL RECOMENDADA EN LINUX: /opt/lampp/htdocs/smartpark/api.php
 * DESCRIPCIÓN: Controlador API REST en PHP para conectar el frontend de React con MySQL en XAMPP.
 * SOPORTE CORS: Habilitado para permitir peticiones desde http://localhost:3000 o http://localhost:5173.
 */

// Cabeceras HTTP para permitir peticiones externas (CORS) y formato JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Responder con código 200 OK inmediatamente para solicitudes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de conexión a la base de datos MySQL (XAMPP por defecto)
$host = "localhost";
$db_name = "smartpark_db";
$username = "root";
$password = ""; // Contraseña vacía por defecto en XAMPP local

try {
    // Inicializar conexión PDO
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos de XAMPP: " . $exception->getMessage()
    ]);
    exit();
}

// Obtener el método HTTP de la petición
$method = $_SERVER['REQUEST_METHOD'];

// Obtener la ruta o acción solicitada (por ejemplo: api.php?action=reservas)
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        if ($action === 'usuarios') {
            $query = "SELECT * FROM usuarios";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
        } 
        elseif ($action === 'vehiculos') {
            $query = "SELECT * FROM vehiculos";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
        }
        elseif ($action === 'espacios') {
            $query = "SELECT * FROM espacios";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
        }
        else {
            // Por defecto devuelve la lista de reservas activas
            $query = "SELECT * FROM reservas ORDER BY id DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
        }
        break;

    case 'POST':
        // Leer datos JSON de la petición
        $input = json_decode(file_get_contents("php://input"), true);
        
        if ($action === 'crear_reserva') {
            if (!empty($input['id']) && !empty($input['placa_vehiculo'])) {
                try {
                    $query = "INSERT INTO reservas (id, usuario_id, usuario_nombre, codigo_espacio, placa_vehiculo, tipo_vehiculo, hora_inicio, hora_fin, monto_estimado, estado) 
                              VALUES (:id, :usuario_id, :usuario_nombre, :codigo_espacio, :placa_vehiculo, :tipo_vehiculo, :hora_inicio, :hora_fin, :monto_estimado, 'pendiente')";
                    
                    $stmt = $conn->prepare($query);
                    $stmt->execute([
                        ':id' => $input['id'],
                        ':usuario_id' => isset($input['usuario_id']) ? $input['usuario_id'] : 'usr_anon',
                        ':usuario_nombre' => isset($input['usuario_nombre']) ? $input['usuario_nombre'] : 'Invitado',
                        ':codigo_espacio' => $input['codigo_espacio'],
                        ':placa_vehiculo' => $input['placa_vehiculo'],
                        ':tipo_vehiculo' => isset($input['tipo_vehiculo']) ? $input['tipo_vehiculo'] : 'auto',
                        ':hora_inicio' => isset($input['hora_inicio']) ? $input['hora_inicio'] : date("H:i"),
                        ':hora_fin' => isset($input['hora_fin']) ? $input['hora_fin'] : date("H:i", strtotime("+2 hours")),
                        ':monto_estimado' => isset($input['monto_estimado']) ? $input['monto_estimado'] : 0.00
                    ]);

                    // Actualizar estado del espacio a 'reservado'
                    $updateQuery = "UPDATE espacios SET estado = 'reservado' WHERE codigo_espacio = :codigo";
                    $updateStmt = $conn->prepare($updateQuery);
                    $updateStmt->execute([':codigo' => $input['codigo_espacio']]);

                    echo json_encode(["success" => true, "message" => "Reserva guardada con éxito en MySQL"]);
                } catch (PDOException $e) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "message" => "Error guardando reserva: " . $e->getMessage()]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Datos incompletos"]);
            }
        }
        elseif ($action === 'registro_transito') {
            // Registrar entrada o salida real (Ingreso barrera inteligente / Arduino)
            if (!empty($input['placa'])) {
                $placa = strtoupper($input['placa']);
                $tipo_accion = isset($input['accion']) ? $input['accion'] : 'entrada'; // 'entrada' o 'salida'

                if ($tipo_accion === 'entrada') {
                    // Buscar si hay reserva pendiente para esta placa
                    $query = "SELECT * FROM reservas WHERE placa_vehiculo = :placa AND estado = 'pendiente' LIMIT 1";
                    $stmt = $conn->prepare($query);
                    $stmt->execute([':placa' => $placa]);
                    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($reserva) {
                        // Actualizar reserva a activa y registrar fecha/hora de entrada
                        $update = "UPDATE reservas SET estado = 'activa', entrada_real = NOW() WHERE id = :id";
                        $uStmt = $conn->prepare($update);
                        $uStmt->execute([':id' => $reserva['id']]);

                        // Ocupar el espacio correspondiente
                        $upSpace = "UPDATE espacios SET estado = 'ocupado' WHERE codigo_espacio = :codigo";
                        $usStmt = $conn->prepare($upSpace);
                        $usStmt->execute([':codigo' => $reserva['codigo_espacio']]);

                        echo json_encode([
                            "success" => true,
                            "tipo" => "reserva_activa",
                            "message" => "¡Barrera Levantada! Socio: " . $reserva['usuario_nombre'] . " - Bahía: " . $reserva['codigo_espacio'],
                            "reserva" => $reserva
                        ]);
                    } else {
                        // Flujo Drop-in (Ingreso directo sin reserva previa)
                        // Buscar una bahía vacía disponible
                        $tipo_v = isset($input['tipo_vehiculo']) ? $input['tipo_vehiculo'] : 'auto';
                        $findSpace = "SELECT * FROM espacios WHERE tipo = :tipo AND estado = 'disponible' LIMIT 1";
                        $fsStmt = $conn->prepare($findSpace);
                        $fsStmt->execute([':tipo' => $tipo_v]);
                        $espacioLibre = $fsStmt->fetch(PDO::FETCH_ASSOC);

                        if ($espacioLibre) {
                            $reservaId = "res_" . uniqid();
                            $insQuery = "INSERT INTO reservas (id, usuario_nombre, codigo_espacio, placa_vehiculo, tipo_vehiculo, hora_inicio, estado, entrada_real) 
                                         VALUES (:id, 'Cliente Sin Reserva', :codigo, :placa, :tipo, :inicio, 'activa', NOW())";
                            $insStmt = $conn->prepare($insQuery);
                            $insStmt->execute([
                                ':id' => $reservaId,
                                ':codigo' => $espacioLibre['codigo_espacio'],
                                ':placa' => $placa,
                                ':tipo' => $tipo_v,
                                ':inicio' => date("H:i")
                            ]);

                            // Ocupar espacio
                            $upSpace = "UPDATE espacios SET estado = 'ocupado' WHERE codigo_espacio = :codigo";
                            $usStmt = $conn->prepare($upSpace);
                            $usStmt->execute([':codigo' => $espacioLibre['codigo_espacio']]);

                            echo json_encode([
                                "success" => true,
                                "tipo" => "drop_in",
                                "message" => "¡Barrera Levantada! Ingreso directo asignado a Bahía " . $espacioLibre['codigo_espacio'],
                                "codigo_espacio" => $espacioLibre['codigo_espacio']
                            ]);
                        } else {
                            echo json_encode(["success" => false, "message" => "No hay bahías disponibles para este tipo de vehículo."]);
                        }
                    }
                }
            } else {
                echo json_encode(["success" => false, "message" => "Falta la placa del vehículo."]);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no soportado"]);
        break;
}
?>
