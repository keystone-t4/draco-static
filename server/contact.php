<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

require __DIR__ . '/lib/env.php';
require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

$env = draco_load_env(__DIR__ . '/.env');

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
if (!is_array($input)) {
    $input = $_POST;
}

$name = trim((string) ($input['name'] ?? ''));
$company = trim((string) ($input['company'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$country = trim((string) ($input['country'] ?? ''));
$category = trim((string) ($input['category'] ?? ''));
$message = trim((string) ($input['message'] ?? ''));
$honeypot = trim((string) ($input['website'] ?? ''));

// Bots that fill in the hidden honeypot field get a fake success — no email sent.
if ($honeypot !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Please complete the required fields (name, email and message).']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Please provide a valid email address.']);
    exit;
}

$required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_ENCRYPTION', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_TO'];
$missing = array_filter($required, fn($key) => empty($env[$key]));
if ($missing) {
    error_log('DRACO contact form: missing .env keys: ' . implode(', ', $missing));
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'The contact form is not fully configured yet. Please email us directly.']);
    exit;
}

$body = "New inquiry from the DRACO website contact form\n\n"
    . "Name: {$name}\n"
    . "Company: {$company}\n"
    . "Email: {$email}\n"
    . "Country: {$country}\n"
    . "Product category: {$category}\n\n"
    . "Message:\n{$message}\n";

$mail = new \PHPMailer\PHPMailer\PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $env['SMTP_HOST'];
    $mail->Port = (int) $env['SMTP_PORT'];
    $mail->SMTPAuth = true;
    $mail->Username = $env['SMTP_USER'];
    $mail->Password = $env['SMTP_PASS'];
    // .env uses "ssl" (implicit TLS, port 465) or "tls" (STARTTLS, port 587) —
    // these match PHPMailer's ENCRYPTION_SMTPS / ENCRYPTION_STARTTLS values directly.
    $mail->SMTPSecure = $env['SMTP_ENCRYPTION'];
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($env['SMTP_FROM'], $env['SMTP_FROM_NAME'] ?? 'DRACO Website');
    $mail->addAddress($env['SMTP_TO']);
    $mail->addReplyTo($email, $name);

    $mail->Subject = 'New inquiry from DRACO website — ' . $name;
    $mail->Body = $body;

    $mail->send();
    echo json_encode(['ok' => true]);
} catch (\PHPMailer\PHPMailer\Exception $e) {
    error_log('DRACO contact form send failed: ' . $mail->ErrorInfo);
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Could not send your message right now. Please try again later or email us directly.']);
}
