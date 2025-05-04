<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


// Get raw JSON input
$data = json_decode(file_get_contents("php://input"), true);

$course_code = $data['course_code'];
$name = $data['name'];
$faculty_id = intval($data['faculty_id']);
$duration = intval($data['duration']);
$start_time = $data['start_time'];
$end_time = $data['end_time'];
$is_pinned = $data['is_pinned'] ? 1 : 0;
$days = $data['days'];

$stmt = $conn->prepare("INSERT INTO Course (course_code, fid, name, duration, start_time, end_time, is_pinned)
                        VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sisissi", $course_code, $faculty_id, $name, $duration, $start_time, $end_time, $is_pinned);

if ($stmt->execute()) {
    $crn = $conn->insert_id;

    // Insert into Course_Days
    foreach ($days as $day) {
        $dstmt = $conn->prepare("INSERT INTO Course_Days (CRN, days) VALUES (?, ?)");
        $dstmt->bind_param("is", $crn, $day);
        $dstmt->execute();
    }

    // Assuming you got $crn = last_insert_id() or provided in PUT
    $prereqs = $_POST['prereqs'] ?? [];
    $coreqs = $_POST['coreqs'] ?? [];

    foreach ($prereqs as $p) {
        $stmt = $conn->prepare("INSERT INTO Prereqs (prereq_CRN, CRN) VALUES (?, ?)");
        $stmt->bind_param("ii", $p, $crn);
        $stmt->execute();
    }

    foreach ($coreqs as $c) {
        $stmt = $conn->prepare("INSERT INTO Coreqs (CRN1, CRN2) VALUES (?, ?)");
        $stmt->bind_param("ii", $crn, $c);
        $stmt->execute();
    }


    echo json_encode(["status" => "success", "message" => "Course added"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add course"]);
}

$stmt->close();
$conn->close();
