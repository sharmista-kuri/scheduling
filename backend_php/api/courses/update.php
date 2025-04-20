<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$data = json_decode(file_get_contents("php://input"), true);

$crn = $data['crn'] ?? null;
if (!$crn) {
    http_response_code(400);
    echo json_encode(["message" => "CRN is required"]);
    exit;
}

// Prepare dynamic update query
$fields = [];
$params = [];
$types = "";

// Add only fields that are present
if (isset($data['course_code'])) {
    $fields[] = "course_code = ?";
    $params[] = $data['course_code'];
    $types .= "s";
}

if (isset($data['name'])) {
    $fields[] = "name = ?";
    $params[] = $data['name'];
    $types .= "s";
}

if (isset($data['faculty_id'])) {
    $fields[] = "fid = ?";
    $params[] = $data['faculty_id'];
    $types .= "i";
}

if (isset($data['duration'])) {
    $fields[] = "duration = ?";
    $params[] = $data['duration'];
    $types .= "i";
}

if (isset($data['start_time'])) {
    $fields[] = "start_time = ?";
    $params[] = $data['start_time'];
    $types .= "s";
}

if (isset($data['end_time'])) {
    $fields[] = "end_time = ?";
    $params[] = $data['end_time'];
    $types .= "s";
}

if (isset($data['is_pinned'])) {
    $fields[] = "is_pinned = ?";
    $params[] = $data['is_pinned'];
    $types .= "i";
}

// You can add more fields like 'days', etc. if needed

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(["message" => "No valid fields provided"]);
    exit;
}

// Add CRN as last param for WHERE clause
$params[] = $crn;
$types .= "i";

$sql = "UPDATE Course SET " . implode(", ", $fields) . " WHERE CRN = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["message" => "Course updated"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Update failed"]);
}

