<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];

$sql = "SELECT * FROM Faculty WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['PASSWORD'])) {
        echo json_encode([
            "role" => $user['auth_level'],
            "fid" => $user['fid'],
            "name" => $user['NAME'],
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid password"]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "User not found"]);
}



