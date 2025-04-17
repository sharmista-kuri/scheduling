<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$crn = $_GET['crn'] ?? null;

if (!$crn) {
    http_response_code(400);
    echo json_encode(["message" => "Missing CRN"]);
    exit;
}

// Delete from Course_Days first (foreign key constraint)
$conn->query("DELETE FROM Course_Days WHERE CRN = $crn");

// Then delete the course itself
if ($conn->query("DELETE FROM Course WHERE CRN = $crn")) {
    echo json_encode(["message" => "Course deleted"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Delete failed"]);
}

$conn->close();
