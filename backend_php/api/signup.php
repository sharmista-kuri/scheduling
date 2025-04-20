<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = $data['password'];
$auth_level = $data['auth_level'] ?? 'faculty';

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["message" => "Missing fields"]);
    exit;
}

// Check if email exists
$check = $conn->prepare("SELECT * FROM Faculty WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["message" => "Email already registered"]);
    exit;
}

// Hash password securely
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("INSERT INTO Faculty (name, email, password, auth_level) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $hashed_password, $auth_level);

if ($stmt->execute()) {
    echo json_encode(["message" => "Signup successful! Please log in."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Signup failed"]);
}
