<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$data = json_decode(file_get_contents("php://input"));

$fid = $data->fid;
$name = $data->name;
$email = $data->email;
$password = $data->password;

// If password is set, update it. Otherwise skip password
if (!empty($password)) {
    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE Faculty SET name=?, email=?, password=? WHERE fid=?");
    $stmt->bind_param("sssi", $name, $email, $hashed, $fid);
} else {
    $stmt = $conn->prepare("UPDATE Faculty SET NAME=?, email=? WHERE fid=?");
    $stmt->bind_param("ssi", $name, $email, $fid);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
