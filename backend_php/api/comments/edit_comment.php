<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$data = json_decode(file_get_contents("php://input"), true);

$cid = $data['cid'] ?? null;
$fid = $data['fid'] ?? null;
$text = $data['comment_text'] ?? null;

if (!$cid || !$fid || !$text) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit;
}

// Check if user is owner or admin
$sql = "
SELECT cid, c.fid AS comment_fid, f.auth_level
FROM Comment c
JOIN Faculty f ON f.fid = ?
WHERE c.cid = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $fid, $cid);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $is_owner = $row['comment_fid'] == $fid;
    $is_admin = $row['auth_level'] === 'admin';

    if ($is_owner || $is_admin) {
        $upd = $conn->prepare("UPDATE Comment SET comment_text = ? WHERE cid = ?");
        $upd->bind_param("si", $text, $cid);
        $upd->execute();
        echo json_encode(["message" => "Comment updated"]);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Not authorized"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Comment not found"]);
}
