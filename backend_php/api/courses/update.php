<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$data = json_decode(file_get_contents("php://input"), true);
// var_dump($data);exit;
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

    

    if (isset($data['days'])) {
        $days = $data['days'];

        $deleteSql = "DELETE FROM Course_Days WHERE CRN = $crn";
        mysqli_query($conn, $deleteSql);

        // Prepare the insert statement for Course_Days
        $stmt = $conn->prepare("INSERT INTO Course_Days (CRN, days) VALUES (?, ?)");

        // Loop through days and bind each one
        //foreach ($days as $day) {
        $days_str = implode(",", $days);
        $stmt->bind_param("is", $crn, $days_str);
        $stmt->execute();
        //}
    }

    // ------------------------------
    // Update Prereqs
    if (isset($data['prereqs']) && is_array($data['prereqs'])) {
        $conn->query("DELETE FROM Prereqs WHERE CRN = $crn");

        $stmt = $conn->prepare("INSERT INTO Prereqs (prereq_CRN, CRN) VALUES (?, ?)");
        foreach ($data['prereqs'] as $pre_crn) {
            $stmt->bind_param("ii", $pre_crn, $crn);
            $stmt->execute();
        }
    }

    // ------------------------------
    // Update Coreqs
    if (isset($data['coreqs']) && is_array($data['coreqs'])) {
        $conn->query("DELETE FROM Coreqs WHERE CRN1 = $crn");

        $stmt = $conn->prepare("INSERT INTO Coreqs (CRN1, CRN2) VALUES (?, ?)");
        foreach ($data['coreqs'] as $co_crn) {
            $stmt->bind_param("ii", $crn, $co_crn);
            $stmt->execute();
        }
    }


    

    

    echo json_encode(["message" => "Course updated"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Update failed"]);
}

