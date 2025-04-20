<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$sql = "
    SELECT 
        c.CRN,
        c.course_code,
        c.name AS course_name,
        f.name AS faculty_name,
        f.fid AS faculty_id,
        c.start_time,
        c.end_time,
        c.duration,
        c.is_pinned,
        GROUP_CONCAT(cd.days) AS days
    FROM Course c
    JOIN Faculty f ON c.fid = f.fid
    LEFT JOIN Course_Days cd ON c.CRN = cd.CRN
    GROUP BY c.CRN
";

$result = $conn->query($sql);

$courses = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
}

echo json_encode($courses);
$conn->close();
