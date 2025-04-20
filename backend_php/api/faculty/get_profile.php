<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$fid = $_GET['fid'];


$stmt = $conn->prepare("SELECT name, email FROM faculty WHERE fid = ?");
$stmt->bind_param("i", $fid);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo json_encode([
    'name' => $row['name'],
    'email' => $row['email']
]);

$conn->close();
?>
