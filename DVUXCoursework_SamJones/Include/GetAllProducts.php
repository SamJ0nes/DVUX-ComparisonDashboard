<?php
include "Connect.php";
header('Content-Type: application/json');

$data = array();



// else no checked checkboxes were found therefore display all
$sql = "SELECT ProductId, Colour FROM product";
$result = mysqli_query($conn, $sql);

foreach ($result as $row) 
{
    $data[] = $row;

}

print json_encode($data);