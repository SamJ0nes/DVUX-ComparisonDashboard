<?php
include "Connect.php";
header('Content-Type: application/json');

$data = array();

// If product Ids from POST body was found get specified product details
if(isset($_POST['ProductIds'])){ 
    $selectedProductIds = $_POST['ProductIds'];

    $inQuery = implode(",", $selectedProductIds);

    $sql = "SELECT ProductId, Price, Protein, Title, ServingSize FROM product p JOIN nutrition n ON p.NutritionId = n.NutritionId WHERE ProductId In (".$inQuery.") ORDER BY Protein desc";

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
else{ // Else get all products in the dtb.
    $sql = "SELECT Price, Protein, Title, ServingSize FROM product p JOIN nutrition n ON p.NutritionId = n.NutritionId ORDER BY ProteinPerServing desc";
    $result = mysqli_query($conn, $sql);
    
    foreach ($result as $row) 
    {
        $data[] = $row;
  
    }
}

print json_encode($data);