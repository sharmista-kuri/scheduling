<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$crn = $_GET['crn'] ?? null;

if (!$crn) {
    http_response_code(400);
    echo json_encode(["message" => "CRN missing"]);
    exit;
}

$sql = "
SELECT c.comment_text, c.time_posted, f.name AS faculty_name
FROM Comment c
JOIN Faculty f ON c.fid = f.fid
WHERE c.CRN = ?
ORDER BY c.time_posted DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $crn);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

echo json_encode($comments);
