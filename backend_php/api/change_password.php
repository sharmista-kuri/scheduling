<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$data = json_decode(file_get_contents("php://input"), true);

$userId = $data['userId'] ?? null;
$oldPassword = $data['oldPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';
//var_dump($oldPassword);exit;
if (!$userId || !$oldPassword || !$newPassword) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}


$stmt = $conn->prepare("SELECT password FROM faculty WHERE fid = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$stmt->bind_result($hashedPassword);
$stmt->fetch();
$stmt->close();

if (!password_verify($oldPassword, $hashedPassword)) {
    echo json_encode(["success" => false, "message" => "Incorrect current password"]);
    exit;
}

$newHashed = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $conn->prepare("UPDATE faculty SET password = ? WHERE fid = ?");
$stmt->bind_param("ss", $newHashed, $userId);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>
