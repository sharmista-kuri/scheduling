<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');


$sql = "
    SELECT 
        *
    FROM Faculty f 
";

$result = $conn->query($sql);

$courses = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
}
// var_dump($courses);exit;
echo json_encode($courses);
$conn->close();
