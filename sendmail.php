<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (isset($_GET['ping'])) { echo json_encode(['ok'=>true,'msg'=>'PHP vivo']); exit; }

function clean($v){ return htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8'); }
$name  = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$msg   = clean($_POST['message'] ?? '');

if ($name==='' || $email==='' || $msg==='') { echo json_encode(['ok'=>false,'msg'=>'Faltan campos']); exit; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['ok'=>false,'msg'=>'Correo no válido']); exit; }

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/phpmailer/Exception.php';

$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->setLanguage('es');

// debug a logs (temporal)
$mail->SMTPDebug = 2;
$mail->Debugoutput = function($str,$level){ error_log("SMTP[$level]: $str"); };

try {
  $mail->isSMTP();
  $mail->Host       = 'smtp.hostinger.com';
  $mail->SMTPAuth   = true;
  $mail->Username   = 'efra@efrainaguilar.com';
  $mail->Password   = 'C0l1br178$'; // sin comas extras
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port       = 587; // si falla, prueba SMTPS + 465 (ver paso 6)

  $mail->setFrom('efra@efrainaguilar.com', 'Web EfrainAguilar.com');
  $mail->addAddress('efra@efrainaguilar.com', 'Efrain Aguilar');
  $mail->addReplyTo($email, $name);

  $mail->isHTML(true);
  $mail->Subject = "Nuevo mensaje de contacto — $name";
  $mail->Body    = "<h2>Nuevo mensaje desde el sitio</h2>
                    <p><strong>Nombre:</strong> {$name}</p>
                    <p><strong>Correo:</strong> {$email}</p>
                    <p><strong>Mensaje:</strong><br>".nl2br($msg)."</p>";
  $mail->AltBody = "Nombre: $name\nCorreo: $email\n\nMensaje:\n$msg";

  $mail->send();
  echo json_encode(['ok'=>true,'msg'=>'¡Enviado!']);
} catch (Exception $e) {
  error_log('Mailer Error: '.$mail->ErrorInfo);
  echo json_encode(['ok'=>false,'msg'=>'No se pudo enviar. Intenta por WhatsApp.']);
}
