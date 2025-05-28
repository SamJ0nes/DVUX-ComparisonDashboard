<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
</head>

    <body>

        <div class="Container">
            <!--This is the menu mavigation bar which floats at the top of the screen by using a header tag. -->
            <header>
                <div class="Title">
                <a id="HomeButton">Protein Snack Comparison</a>
                </div>

            </header>

            <div class="MainBody">
                <div class="DashboardArea">
                    <!-- Dropdown for selection of products to display in the chart -->
                    <div class='Dropdown' id="Dropdown">
                        <div class="Filter" id='ProductFilter'>
                            <div Id="FilterTitleSection">
                                <h1>Filter</h1>
                            </div>
                            <div Id="FilterContent">
                                <div name="Chart1Filters">
                                    <h3>Chart 1 Filters</h2>
                                    <div class="FilterSection" id='CheckboxFilter'>
                                        <P>Select any products you wish to compare.</P>
                                        <ul class="show" id="ProductList">
                                            <?php 
                                                include "Include\Connect.php";
                                                $sql="SELECT DISTINCT Title, ProductId FROM product";
                                                $result = mysqli_query($conn, $sql);
                                                while($row = mysqli_fetch_assoc($result)){
                                                echo "<li><input type='checkbox' class='product-checkbox' value='".$row['ProductId']."' checked></input>".$row['Title']."</li>";
                                                }
                                            ?>
                                        </ul>
                                    </div>
                                    <div class="FilterSection" id='SliderFilter'>
                                        <P>Adjust the max price:</P>
                                        <div>
                                            <input type="range" id="priceRange" min="2.00" max="3.00" step="0.20" value="3.00" list="values" class="slider">
                                            <datalist id="values">
                                                <option value="2" label="£2.00"></option>
                                                <option value="2.2" label="£2.20"></option>
                                                <option value="2.4" label="£2.40"></option>
                                                <option value="2.6" label="£2.60"></option>
                                                <option value="2.8" label="£2.80"></option>
                                                <option value="3" label="£3.00"></option>
                                            </datalist>
                                        </div>
                                    </div>
                                    <div class="FilterSection" id='SwitchFilter'>
                                        <P>Show Price To Protein Ratio:</P>
                                        <div>
                                        <label class="switch">
                                            <input type="checkbox" id='drawSwitch'>
                                            <span class="toggle"></span>
                                        </label>
                                        </div>
                                    </div>
                                </div>
                                <div name="Chart2Filters">
                                    <h3>Chart 2 Filters</h2>
                                    <div class="FilterSection" id='dropdownFilter'>
                                        <div class="DropdownSelect" id="DropdownList">
                                            <p>Select a product:</p>
                                            <select class="ProductSelect" id="ProductSelect">
                                                <?php 
                                                    include "Include\Connect.php";
                                                    $sql="SELECT DISTINCT Title, ProductId FROM product";
                                                    $result = mysqli_query($conn, $sql);
                                                    while($row = mysqli_fetch_assoc($result)){
                                                    echo "<option value='".$row['ProductId']."'>".$row['Title']."</option>";
                                                    }
                                                ?>
                                            </select>
                                        </div>
                                        <div class="DropdownSelect" id="DropdownList2">
                                            <p>Select a second product:</p>
                                            <select class="ProductSelect" id="ProductSelect2">
                                                <?php 
                                                    include "Include\Connect.php";
                                                    $sql="SELECT DISTINCT Title, ProductId FROM product";
                                                    $result = mysqli_query($conn, $sql);
                                                    while($row = mysqli_fetch_assoc($result)){
                                                        if($row['ProductId'] == 4   ){
                                                            echo "<option value='".$row['ProductId']."' selected>".$row['Title']."</option>";
                                                        }
                                                        else{
                                                            echo "<option value='".$row['ProductId']."'>".$row['Title']."</option>";
                                                        }
                                                    }
                                                ?>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div id="LeftSide">

                        <div class="popup" onmouseover="togglePopup()"><i class="bi bi-info-circle"></i>
                            <span class="popuptext" id="myPopup"><p>
                            This graph compares the prices and protein content per 100g of protein snack products. <br><br>
                            To help make a well informed decision, toggle on the Price and Protein Ratio switch in the Filter of Chart 1. 
                            This will draw on the chart to help you see visualise which products have a better value for money in terms of protein content per 100g. <br><br>
                            The colour is determined through the distance between its price plot and its protein plot.
                            </p></span>
                        </div>

                        <!-- Canvas displaying price and kcals of products and div wrapper for stylings -->
                        <div Class="ChartWrapper" Id="PriceProteinChartWrapper">

                            <!-- style= "width: 90%; height:100%;" -->
                            <canvas Class="ChartCanvas" id="PriceProteinCanvas"></canvas>

                        </div>

                    </div>

                    <div Id="RightSide">

                        <button class='SubmitButton' onclick='toggleProductDRIPopup()'>View Product DRI <i class='bi bi-x-circle'></i></button>
                    <!-- <span class='close' onclick='toggleProductDRIPopup()'>View Product DRI <i class='bi bi-x-circle'></i></span> -->
                        <div class ="ProductAreaPop hide" id ="ProductAreaPop">
                            <div class="RDIProductsArea">
                                <div class="HighlightedProduct" id="DRIArea">
                                    <div class="popup" onmouseover="togglePopup()"><i class="bi bi-question-circle"></i>
                                        <span class="popuptext" id="myPopup"><p>
                                            The Daily Reference Intake is a UK government reccomended guideline for the daily intake of nutritional values.
                                        </p></span>
                                    </div>
                                    <h3 id="DRITitle" style="text-align:center; display:inline-block;">Daily Reference Intake</h3>

                                    <span class='close' onclick='toggleProductDRIPopup()'><i class='bi bi-x-circle'></i></span>
                                    <table class="DRITable">
                                        <tr>
                                            <th>Energy KCal</th>
                                            <th>Salt</th>
                                            <th>Sugar</th>
                                            <th>Fat</th>
                                        </tr>
                                        <tr>
                                            <td>2000 kcal</td>
                                            <td>6g</td>
                                            <td>90g</td>
                                            <td>70g</td>
                                        </tr>
                                    </table>
                                </div>

                                <div id="Product1DRIArea">
                                    <div class="Accordion">
                                        <div class="title-container" onclick="toggleAccordion('P1','ExpMinIcon1')">
                                            <h3 id="Product1Title" style="padding-right:20px;"></h3>
                                            <div id="ExpMinIcon1">
                                                <i class="bi bi-caret-up-fill"></i>
                                            </div>
                                        </div>
                                        <span class="AccordionText hide" id='P1'>
                                            <div class="HighlightedProduct" id="Product1Area">
                                                <div class="HighlightedDataArea" id="Product1DataArea">
                                                    <div class="HighlightedData" id="Product1EnergyArea" style="background-color:lightgrey;">
                                                        <div class="KeyDataTitle">
                                                            <h5>Energy<br>(kcal) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="EnergyDataPoint1"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="EnergyPercentage1"></p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product1SaltArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Salt<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="SaltDataPoint1"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="SaltPercentage1"></p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product1SugarArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Sugar<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="SugarDataPoint1"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="SugarPercentage1">30%</p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product1FatArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Fat<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="FatDataPoint1"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="FatPercentage1">30%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p style="text-align:center; padding:2px;">% of an adults Daily Reference Intake </p>
                                        </span>
                                    </div>
                                </div>
                            
                                <div id="Product2DRIArea">
                                    <div class="Accordion">
                                        <div class="title-container" onclick="toggleAccordion('P2', 'ExpMinIcon2')">
                                            <h3 id="Product2Title" style="padding-right:20px;"></h3>
                                            <div id="ExpMinIcon2">
                                                <i class="bi bi-caret-up-fill"></i>
                                            </div>
                                        </div>
                                        <span class="AccordionText hide" id="P2">

                                            <div class="HighlightedProduct" id="Product2Area">
                                                <div class="HighlightedDataArea" id="Product2DataArea">
                                                    <div class="HighlightedData" id="Product2EnergyArea" style="background-color:lightgrey;">
                                                        <div class="KeyDataTitle">
                                                            <h5>Energy<br>(kcal) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="EnergyDataPoint2"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="EnergyPercentage2"></p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product2SaltArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Salt<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="SaltDataPoint2"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="SaltPercentage2"></p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product2SugarArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Sugar<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="SugarDataPoint2"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="SugarPercentage2">30%</p>
                                                        </div>
                                                    </div>

                                                    <div class="HighlightedData" id="Product2FatArea">
                                                        <div class="KeyDataTitle">
                                                            <h5>Fat<br>(g) per serving</h5>
                                                        </div>
                                                        <div class="KeyDataPoint">
                                                            <p id="FatDataPoint2"></p>
                                                        </div>
                                                        <div class="KeyDataPercentage">
                                                            <p id="FatPercentage2">30%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style="text-align:center; padding:2px;">% of an adults Daily Reference Intake </p>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="popup" onmouseover="togglePopup()"><i class="bi bi-info-circle"></i>
                            <span class="popuptext" id="myPopup"><p>
                                This graph allows you to analyse a singular products nutrition against the Reference Daily Intake (RDI)
                                 values to help pick the perfect snack for your diet type.<br><br>
                                 Depending on your dietary needs, you could pick a snack with higher or lower calories, salt, sugar, or fat.<br><br>
                                 If you are keen on weight loss, stick to products with a lower percentage of daily intake.
                            </p></span>
                        </div>
                        <!-- Canvas displaying price and kcals of products and div wrapper for stylings -->
                        <div Class="ChartWrapper" Id="NutritionChartWrapper">
                            <!-- style= "width: 90%; height:100%;" -->
                            <canvas Class="ChartCanvas" id="NutritionCanvas"></canvas>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </body>

    <script type="text/javascript" src="JS\DashboardJS.js"></script>
    <link rel="stylesheet" href="Styles/DashboardStyle.css">

</html>