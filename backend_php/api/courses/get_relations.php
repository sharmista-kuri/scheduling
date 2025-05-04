<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config.php');

$crn = $_GET['crn'];
$data = ['prereqs' => [], 'coreqs' => []];

$pre_sql = "SELECT prereq_CRN FROM Prereqs WHERE CRN = ?";
$stmt = $conn->prepare($pre_sql);
$stmt->bind_param("i", $crn);
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $data['prereqs'][] = $row['prereq_CRN'];
}

$core_sql = "SELECT CRN2 FROM Coreqs WHERE CRN1 = ?";
$stmt = $conn->prepare($core_sql);
$stmt->bind_param("i", $crn);
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $data['coreqs'][] = $row['CRN2'];
}

echo json_encode($data);
?>
