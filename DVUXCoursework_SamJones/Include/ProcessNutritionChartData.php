<?php
include "Connect.php";
header('Content-Type: application/json');

$data = array();

// If both dropdowns product Ids were given
if(isset($_POST['ProductId']) && isset($_POST['Product2Id'])){ 
    $selectedProductId = (int)$_POST['ProductId'];
    $selectedProduct2Id = (int)$_POST['Product2Id'];

    $sql = "SELECT ProductId, Title, ServingSize, EnergyKcal, Salt, Sugar, Fat FROM product p JOIN nutrition n ON p.NutritionId = n.NutritionId WHERE ProductId In ($selectedProductId, $selectedProduct2Id)";
    
    $result = mysqli_query($conn, $sql);
    if ($result) {
        // Fetch rows from the result set
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    } 
    else {
        // Handle the case where the query fails
        $data[] = ["error" => "Query failed."];
    }   
}
else if(isset($_POST['ProductId'])){ // ELse if only one of the product Ids is given.

    $selectedProductId = (int)$_POST['ProductId'];

    $sql = "SELECT ProductId, Title, ServingSize, EnergyKcal, Salt, Sugar, Fat FROM product p JOIN nutrition n ON p.NutritionId = n.NutritionId WHERE ProductId = ".$selectedProductId;
    
    $result = mysqli_query($conn, $sql);
    if ($result) {
        // Fetch rows from the result set
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    } 
    else {
        // Handle the case where the query fails
        $data[] = ["error" => "Query failed."];
    }   
}
else{ // Else return product Id == 1 as default
    $sql = "SELECT ProductId, Title, ServingSize, EnergyKcal, Salt, Sugar, Fat FROM product p JOIN nutrition n ON p.NutritionId = n.NutritionId WHERE ProductId = 1";

    $result = mysqli_query($conn, $sql);
    
    foreach ($result as $row) 
    {
        $data[] = $row;
  
    }
}

print json_encode($data);