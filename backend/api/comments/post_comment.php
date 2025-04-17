<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$data = json_decode(file_get_contents("php://input"), true);

$crn = $data['crn'] ?? null;
$fid = $data['fid'] ?? null;
$text = $data['comment_text'] ?? null;

// echo $fid;exit;

if (!$crn || !$fid || !$text) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO Comment (CRN, fid, comment_text) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $crn, $fid, $text);

if ($stmt->execute()) {
    echo json_encode(["message" => "Comment posted"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to post"]);
}
