// Global Variables
    // Chart() variables
var PriceProteinChart = null;
var NutritionChart = null;
    //Product Variables
var ProductColours = {};
var PriceProteinData = null;
    //Chart Filter variables
var priceFilter = 3;
var isShapeDrawn = false;

// Called whenever DOM (Document Object Model) content is loaded (on load of the HTML webpage)
document.addEventListener('DOMContentLoaded', async function(){
    // Sets the specified Colour of each Product from the database RGBA value.
    SetProductColours();
    // Calls LoadCharts to initialise both of the charts.
    await LoadCharts();


    // When the element with Id 'ProductList' (checkbox list) checkbox selections have changed, it calls this event listener which Updates the PriceProtein Chart.
    document.getElementById('ProductList').addEventListener("change", function(){
        UpdatePriceProteinChart();
    });

    // When the element with Id 'DropdownList' (dropdown for product 1) selection has changed, it calls this event listener which calls to update the nutrition chart.
    document.getElementById('DropdownList').addEventListener("change", function(){
        LoadNutritionChart();
    });

    // When the element with Id 'DropdownList2' (dropdown for product 2) selection has changed, it calls this event listener which calls to update the nutrition chart.
    document.getElementById('DropdownList2').addEventListener("change", function(){
        LoadNutritionChart();
    });

        // When the element with Id 'priceRange' (Y-axis of the PriceProteinChart) value has changed, it calls this event listener which calls to update the PriceProtein chart.
    document.getElementById('priceRange').addEventListener("input", function(){
        priceFilter = this.value;
        UpdatePriceProteinChart();
    });

    // When the element with Id 'drawSwitch' (Switch element to turn on or off the drawings) value has changed, 
    // it calls this event listener which calls to update the PriceProtein chart and change the global boolean to turn to true or false.
    document.getElementById('drawSwitch').addEventListener("change", function(){
        isShapeDrawn = !isShapeDrawn;
        UpdatePriceProteinChart();
    });
    
})

// When the window is resized, this event listenter is called in order to resize the charts, adjusting to the new window size.
window.addEventListener("resize", function(){
    ResizePriceProteinChart();
    ResizeNutritionChart();
});

// Load Chart Functions

/// Function to load both of the charts into the window.
async function LoadCharts()
{
    try 
    {
        // Setup for Chart 1 (Price and Protein)
        var selectedProductIds = getSelectedProductIds();
        var data = await fetchData(selectedProductIds);
        var chartData = processChartData(data);
        initializeChart(chartData);

        // Setup for Chart 2 (nutrition info as percentages of RDI)
        LoadNutritionChart();

    } catch (error) {
        console.log(error);
    }
}

/// Function to get all the product Ids of the checkboxes that are selected (checked) within the checkbox list in the chart filters.
function getSelectedProductIds() {
    return Array.from(document.querySelectorAll('.product-checkbox:checked')).map(checkbox => checkbox.value);
}

/// Uses the selected product Ids to call php file "ProcessChartData.php" to get the necessary information about a product and its nutrition to plot the Price Protein chart.
// This gets and returns the data from the php which calls the database.
function fetchData(selectedProductIds){
    var responseData;

    $.ajax({
        url: "Include/ProcessChartData.php",
        method: "POST",
        async: false,
        data: { ProductIds: selectedProductIds },
        success: function(data=this.responseText) {
            responseData = data;
        },
        error: function(data) {
            console.log("The following error occurred when fetching the chart data: "    );
            console.log(data);
        }});

    return responseData;
}

/// Processes the Raw data given from the database into arrays and objects that can be accessed easily later on.
function processChartData(data){
    PriceProteinData = data;
    var XAxis = [];
    var PriceYAxis = [];
    var ProteinYAxis = [];
    var XProductIds = [];

    data.forEach(item => {
        XProductIds.push(item.ProductId);
        XAxis.push(item.Title);
        PriceYAxis.push(item.Price);
        ProteinYAxis.push(item.Protein);
    });

    return {
        labels: XAxis,
        PriceYAxis,
        ProteinYAxis,
        XProductIds
    };
}

/// Uses the processed chart data to initialise the Chart() ChartJS object models. 
/// Here it uses the data to define and create the data, options, type, and plugins for drawing.
function initializeChart(chartData){
    var canvas = document.getElementById('PriceProteinCanvas');
    var ctx = canvas.getContext('2d');


    // Chart Data Object
    var PriceProteinData = {
        labels: chartData.labels,
        datasets: [{
                type: 'line',
                label: 'Price (£)',
                data: chartData.PriceYAxis,
                yAxisID: 'PriceYAxis',
                borderColor: 'black',
                fill: false,
                pointRadius: 10,
                pointHoverRadius: 15,
                lineTension: 0,
            },
            {
                label: 'Protein Per 100g',
                data: chartData.ProteinYAxis,
                backgroundColor: chartData.XProductIds.map(productId => ProductColours[productId]),
                borderWidth: 1,
                borderColor: 'grey',
                hoverBorderColor: 'black',
                yAxisID: 'ProteinYAxis',
                box: [1,3]
            }
        ]
    };


    // Chart Options Object
    var universalOptions = {
        maintainAspectRatio: false,
        responsive: false,
        title: {
            display: true,
            text: "Comparison of the Prices and Protein Content for Workout Snacks"
        },
        legend: {
            display: false,
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return (data.datasets[tooltipItem.datasetIndex].yAxisID === "PriceYAxis") ?
                        `${datasetLabel}: £${value}` :
                        `${datasetLabel}: ${value}g`;
                }
            },
            backgroundColor: 'rgba(78, 176, 114, 0.8)',
            borderColor: 'rgba(78, 176, 114, 0.8)',
            borderWidth: 1,
            titleFontSize: 16,
            bodyFontSize: 14,
            titleFontColor: 'black',
            bodyFontColor: 'black',
            titleFontStyle: 'bold',
            bodyFontStyle: 'normal',
            titleFontFamily: 'Courier New',
            bodyFontFamily: 'Courier New',
            xPadding: 10,
            yPadding: 8,
            cornerRadius: 5,
            displayColors: false
        },
        scales: {
            yAxes: [{
                    id: 'ProteinYAxis',
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        max: 40,
                        callback: function(value) {
                            return value + "g"; //Adjust Protein Y axis to show g at the end.
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Protein per 100g',
                    },
                    position: 'left'
                },
                {
                    id: 'PriceYAxis',
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        max: 3,
                        callback: function(value) {
                            return '£' + value.toFixed(2); //Adjust Price Y axis to show to 2 d.p.
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Price (£)',
                    },
                    position: 'right'
                }
            ],
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                }
            }],
        }
    };


    // Chart Draw Shape Object
    /// The "afterDatasetsDraw" function is called after each time the datasets are drawn. Therefore this is called also when updating the chart data.
    var drawShape = {
        id: 'drawShape',
        afterDatasetsDraw(chart, args, pluginOptions){
            // Only draw if the switch is on in the filter.
            if(isShapeDrawn){

                // Declare ctx and data.
                var {ctx, data} = chart;

                // chart.getDatasetMeta(1) is bar chart.
                //getDatasetMeta(0) is line.
                var barWidth = chart.getDatasetMeta(1).data[0]._view.width;
    
    
                // For each data point on the chart (each product).
                for (let i = 0; i < chart.getDatasetMeta(0).data.length; i++) {
                // Get the x,y coordinates of the line plot.
                var lineX = chart.getDatasetMeta(0).data[i]._model.x;
                var lineY = chart.getDatasetMeta(0).data[i]._model.y;
    
                // Get the x,y coordinates of the top of the bar chart.
                var barX = chart.getDatasetMeta(1).data[i]._model.x;
                var barY = chart.getDatasetMeta(1).data[i]._model.y;
    
                // Calculate the distance between the line Y plot and bar Y plot.
                var distanceY = lineY - barY;
                
    
                // calculate offset from datapoint (so not overlapping visually): if bar is above line then reverse the offset.
                if (distanceY > 0) {
                    lineY = lineY - 5;
                    barY = barY + 5;
                } else {
                    lineY = lineY + 5;
                    barY = barY - 5;
                }
    
                //calculate line colour based on distance between price and protein:
                var lineColour;
                if (distanceY > 0) { // Excellent.
                    lineColour = 'rgba(0,255,0,1)';
                } 
                else if(distanceY > -75){ // Good.
                    lineColour = 'rgba(175,255,0,1)';
    
                }
                else if(distanceY > -100){ // Medium.
                    lineColour = 'rgba(255,255,0,1)'; 
                }
                else if(distanceY > -150){ // Poor.
                    lineColour = 'rgba(255,175,0,1)';
                }
                else { // Very Poor.
                    lineColour = 'rgba(255,0,0,1)';
                }
    
                // Draw a horizontal line at the level of the line plot Y. Uses the X - or + half the bar width.
                ctx.beginPath();
                ctx.moveTo(lineX - (barWidth / 2), lineY);
                ctx.lineTo(lineX + (barWidth / 2), lineY);
                ctx.strokeStyle = lineColour;
                ctx.lineWidth = 3;
                ctx.stroke();
    
                // Draw a vertical line connecting the line plot to the top of the bar chart.
                ctx.beginPath();
                ctx.moveTo(lineX, lineY);
                ctx.lineTo(barX, barY);
                ctx.strokeStyle = lineColour;
                ctx.lineWidth = 3;
                ctx.stroke();
    
                // Draw a horizontal line at the level of the top of the bar plot Y. Uses the X - or + half the bar width.
                ctx.beginPath();
                ctx.moveTo(barX - (barWidth / 2), barY);
                ctx.lineTo(barX + (barWidth / 2), barY);
                ctx.strokeStyle = lineColour;
                ctx.lineWidth = 3;
                ctx.stroke();
                }

            }
        }
    }


    // Destroy chart so not overlapping.
    if (PriceProteinChart) {
        PriceProteinChart.destroy();
    }

    // Create new Price Protein chart.
    PriceProteinChart = new Chart(ctx, {
        type: 'bar',
        data: PriceProteinData,
        options: universalOptions,
        plugins:[drawShape]
    });

    // Call the function to resize the chart.
    ResizePriceProteinChart();
}

// This function loads up the chart using the dropdown selections in the filters.
function LoadNutritionChart()
{
    $(document).ready(function (){

        // Destroy current chart so doesn't overlap.
        if (NutritionChart) {
            NutritionChart.destroy();
        }
        
        // Get Dropdown element by Id.
        var dropdown1Selection = document.getElementById("ProductSelect").value;
        var dropdown2Selection = document.getElementById("ProductSelect2").value;

        // Link to the PHP file to process the nutrition chart data using POST AJAX.
        var link = "Include/ProcessNutritionChartData.php";

        //Defining the POST body of data.
        var postBodyData = {
            ProductId: dropdown1Selection,
            Product2Id: dropdown2Selection
        }; 


        // Data about product 1.
        var datasetlabel ="";
        var servingSize = 0;
        var NutritionData = [];

        // Data about product 2.
        var datasetlabel2 ="";
        var servingSize2 = 0;
        var NutritionData2 = [];

        $.ajax({
            url: link,
            method: "POST",
            async: true,
            data: postBodyData,
            success: function(data=this.responseText) {
                // Loop through data from PHP and segregate into each product variables.
                for(var i in data) {
                    if(data[i].ProductId == dropdown1Selection){ // Ordering products by dropdown
                        datasetlabel = data[i].Title;
                        servingSize = data[i].ServingSize;
                        NutritionData.push(data[i].EnergyKcal);
                        NutritionData.push(data[i].Salt);
                        NutritionData.push(data[i].Sugar);
                        NutritionData.push(data[i].Fat);
                    }
                    else{
                        datasetlabel2 = data[i].Title;
                        servingSize2 = data[i].ServingSize;
                        NutritionData2.push(data[i].EnergyKcal);
                        NutritionData2.push(data[i].Salt);
                        NutritionData2.push(data[i].Sugar);
                        NutritionData2.push(data[i].Fat);
                    }
                }

                // Labels of the attributes used in the chart.
                var labels = ["EnergyKcal", "Salt", "Sugar", "Fat"];
        
                // These are the Reference Daily Intake values for the average human based on a 2000 calorie diet as per UK Gov
                var DRI = [2000, 6, 90, 70];

                // Calculating the products data to display in the graphic above chart.
                /// for each datapoint, its serving size is calculated by diving by 100 (as given 100g value) and multiplied by the serving size.
                /// for the percentage divide by its DRI value and multiply by 100.
                var ChartData = [];
                var NutritionDataPerServing = [];
                var count = 0;
                NutritionData.forEach(dataPoint => {
                    var servingDataPoint = (dataPoint/100)*servingSize;
                    NutritionDataPerServing.push(servingDataPoint.toFixed(2));
                    var percentage = (servingDataPoint/DRI[count])*100;
                    ChartData.push(percentage.toFixed(1));
                    count ++;
                });
                SetupProduct1Area(NutritionDataPerServing, ChartData, datasetlabel, dropdown1Selection, servingSize);


                /// Do the same as above but for product 2.
                var ChartData2 = [];
                var NutritionDataPerServing2 = [];
                count = 0;
                NutritionData2.forEach(dataPoint => {
                    var servingDataPoint = (dataPoint/100)*servingSize2;
                    NutritionDataPerServing2.push(servingDataPoint.toFixed(2));
                    var percentage = (servingDataPoint/DRI[count])*100;
                    ChartData2.push(percentage.toFixed(1));
                    count ++;
                });
                SetupProduct2Area(NutritionDataPerServing2, ChartData2, datasetlabel2, dropdown2Selection, servingSize2);
                


                // Getting the highest value for the x axis (Percentage Daily Reference Intake) to the maximum value of the ChartData and ChartData2.
                var highestValue = Math.max(...ChartData, ...ChartData2);
                // Uses the highest value to calculate the highest percentage for the axis.
                var percentageAxisMaximum = Math.ceil(highestValue / 10) * 10;

                // If the nutrition data2 is not populated then only display data 1. otherwise opposite.
                // This is omly the case is the user selects the same products for product 1 and product 2 in the dropdowns.
                if (NutritionData2.length == 0) {
                    var chartdata = 
                    {
                        labels: labels,
                        datasets :
                        [
                            {
                                label: datasetlabel, // product title
                                data: ChartData,  // nutrition data
                                fill: true,
                                backgroundColor: ProductColours[dropdown1Selection],
                                borderColor: 'grey',
                                pointBackgroundColor: 'grey',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'grey',
                                borderWidth: '1',
                            },
                        ] 
                    };
                }
                else{
                    var chartdata = 
                    {
                        labels: labels,
                        datasets :
                        [
                            {
                                label: datasetlabel, // product title
                                data: ChartData,  // nutrition data
                                fill: true,
                                backgroundColor: ProductColours[dropdown1Selection],
                                borderColor: 'grey',
                                pointBackgroundColor: 'grey',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'grey',
                                borderWidth: '1',
                            },
                            {
                                label: datasetlabel2, // product title
                                data: ChartData2,  // nutrition data
                                fill: true,
                                backgroundColor: ProductColours[dropdown2Selection],
                                borderColor: 'grey',
                                pointBackgroundColor: 'grey',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'grey',
                                borderWidth: '1',
                            }
                        ] 
                    };
                }


                var universalOptions = 
                {
                    maintainAspectRatio: false,
                    responsive: false,
                    title: 
                    {
                        display: true,
                        text: "Workout Snacks Nutritional Serving Size as a % of the Daily Reference Intake."
                    },
                    legend: 
                    {
                        display: true,
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                                var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                
                                var label = datasetLabel + ': ' + value + '%';
                                return label;
                            }
                        },
                        backgroundColor: 'rgba(78, 176, 114, 0.8)',
                        borderColor: 'rgba(78, 176, 114, 0.8)',
                        borderWidth: 1,
                        titleFontSize: 16,
                        bodyFontSize: 14,
                        titleFontColor: 'black',
                        bodyFontColor: 'black',
                        titleFontStyle: 'bold',
                        bodyFontStyle: 'normal',
                        titleFontFamily: 'Courier New',
                        bodyFontFamily: 'Courier New',
                        xPadding: 10,
                        yPadding: 8,
                        cornerRadius: 5,
                        displayColors: true
                    },  
                    scales: 
                    {
                        yAxes: 
                        [
                            {
                                display: true,
                                ticks: {
                                    beginAtZero: true,
                                },
                                scaleLabel:{
                                    display: true,
                                    labelString: "Products Nutritional Information",
                                    fontSize: 16
                                },
                            }
                        ], 
                        xAxes:
                        [
                            {                                
                                display: true,
                                ticks: {
                                    beginAtZero: true,
                                    max: percentageAxisMaximum,
                                    stepSize: 10,
                                    callback: function(value, index, values) {
                                        if(Number.isInteger(value)){
                                            return value + '%'; // Add % to the x axis 
                                        }
                                        else{
                                            return value;
                                        }
                                    },
                                },
                                scaleLabel:{
                                    display: true,
                                    labelString: "Percentage of Daily Reference Intake (%)",
                                    fontSize: 16
                                },
                            }
                        ],
                    } 
                };

                var config = {
                    type: 'horizontalBar',
                    data: chartdata,
                    options: universalOptions
                    };

                var canvas = document.getElementById('NutritionCanvas');
                var ctx = canvas.getContext('2d');

                NutritionChart = new Chart(ctx, config);           

                ResizeNutritionChart();
            },
            error: function(data) {
                console.log("The following error occurred when loading the chart data: "    );
                console.log(data);
            }});

        });
}

// Setup the DRI Nutritional Information for dropdown product 1.
function SetupProduct1Area(nutritionData, RDIPercentages, label, dropdown1Selection, servingSize){
    var Product1Title = document.getElementById('Product1Title');
    Product1Title.textContent = label+"("+servingSize+"g serving)";
    var Product1Area = document.getElementById('Product1Area');
    Product1Area.style.backgroundColor = ProductColours[dropdown1Selection];

    var EnergyDataPoint = document.getElementById('EnergyDataPoint1');
    var EnergyDataPercentage = document.getElementById('EnergyPercentage1');

    var SaltArea = document.getElementById('Product1SaltArea');
    var SaltDataPoint = document.getElementById('SaltDataPoint1');
    var SaltDataPercentage = document.getElementById('SaltPercentage1');

    var SugarArea = document.getElementById('Product1SugarArea');
    var SugarDataPoint = document.getElementById('SugarDataPoint1');
    var SugarDataPercentage = document.getElementById('SugarPercentage1');

    var FatArea = document.getElementById('Product1FatArea');
    var FatDataPoint = document.getElementById('FatDataPoint1');
    var FatDataPercentage = document.getElementById('FatPercentage1');

    // Only set the area if the data points are given.
    // The colours are set based on the RDI value traffic Light System by .gov.
    if(EnergyDataPoint)
    {
        EnergyDataPoint.textContent = nutritionData[0];
        EnergyDataPercentage.textContent = RDIPercentages[0] + "%";
        
    }
    if(SaltDataPoint)
    {
        var SaltPercentage = RDIPercentages[1];
        var SaltPoint = nutritionData[1];
        if (SaltPoint <= 0.3) {
            SaltArea.style.backgroundColor = "green";

        }
        else if (SaltPoint <= 1.5) {
            SaltArea.style.backgroundColor = "yellow";

        }
        else{
            SaltArea.style.backgroundColor = "red";

        }
        SaltDataPoint.textContent = nutritionData[1];
        SaltDataPercentage.textContent = SaltPercentage + "%";
    }
    if(SugarDataPoint)
    {
        var SugarPercentage = RDIPercentages[2];
        var SugarPoint = nutritionData[2];
        if (SugarPoint <= 5) {
            SugarArea.style.backgroundColor = "green";

        }
        else if (SugarPoint <= 22.5) {
            SugarArea.style.backgroundColor = "yellow";

        }
        else{
            SugarArea.style.backgroundColor = "red";

        }
        SugarDataPoint.textContent = nutritionData[2];
        SugarDataPercentage.textContent = SugarPercentage + "%";
    }
    if(FatDataPoint)
    {
        var FatPercentage = RDIPercentages[3];
        var FatPoint = nutritionData[3];
        if (FatPoint <= 3) {
            FatArea.style.backgroundColor = "green";

        }
        else if (FatPoint <= 17.5) {
            FatArea.style.backgroundColor = "yellow";

        }
        else{
            FatArea.style.backgroundColor = "red";

        }
        FatDataPoint.textContent = nutritionData[3];
        FatDataPercentage.textContent = FatPercentage + "%";
    }

}

// Same as SetupProductArea().
function SetupProduct2Area(nutritionData, RDIPercentages, label, dropdown2Selection, servingSize2){
    var Product2Title = document.getElementById('Product2Title');
    Product2Title.textContent = label+"("+servingSize2+"g serving)";
    var Product2Area = document.getElementById('Product2Area');
    Product2Area.style.backgroundColor = ProductColours[dropdown2Selection];


    var EnergyDataPoint = document.getElementById('EnergyDataPoint2');
    var EnergyDataPercentage = document.getElementById('EnergyPercentage2');

    var SaltArea = document.getElementById('Product2SaltArea');
    var SaltDataPoint = document.getElementById('SaltDataPoint2');
    var SaltDataPercentage = document.getElementById('SaltPercentage2');

    var SugarArea = document.getElementById('Product2SugarArea');
    var SugarDataPoint = document.getElementById('SugarDataPoint2');
    var SugarDataPercentage = document.getElementById('SugarPercentage2');

    var FatArea = document.getElementById('Product2FatArea');
    var FatDataPoint = document.getElementById('FatDataPoint2');
    var FatDataPercentage = document.getElementById('FatPercentage2');

    if(EnergyDataPoint)
    {
        EnergyDataPoint.textContent = nutritionData[0];
        EnergyDataPercentage.textContent = RDIPercentages[0] + "%";
        
    }
    if(SaltDataPoint)
    {
        var SaltPercentage = RDIPercentages[1];
        var SaltPoint = nutritionData[1];
        if (SaltPoint <= 0.3) {
            SaltArea.style.backgroundColor = "green";

        }
        else if (SaltPoint <= 1.5) {
            SaltArea.style.backgroundColor = "yellow";

        }
        else{
            SaltArea.style.backgroundColor = "red";

        }
        SaltDataPoint.textContent = nutritionData[1];
        SaltDataPercentage.textContent = SaltPercentage + "%";
    }
    if(SugarDataPoint)
    {
        var SugarPercentage = RDIPercentages[2];
        var SugarPoint = nutritionData[2];
        if (SugarPoint <= 5) {
            SugarArea.style.backgroundColor = "green";

        }
        else if (SugarPoint <= 22.5) {
            SugarArea.style.backgroundColor = "yellow";

        }
        else{
            SugarArea.style.backgroundColor = "red";

        }
        SugarDataPoint.textContent = nutritionData[2];
        SugarDataPercentage.textContent = SugarPercentage + "%";
    }
    if(FatDataPoint)
    {
        var FatPercentage = RDIPercentages[3];
        var FatPoint = nutritionData[3];
        if (FatPoint <= 3) {
            FatArea.style.backgroundColor = "green";

        }
        else if (FatPoint <= 17.5) {
            FatArea.style.backgroundColor = "yellow";

        }
        else{
            FatArea.style.backgroundColor = "red";

        }
        FatDataPoint.textContent = nutritionData[3];
        FatDataPercentage.textContent = FatPercentage + "%";
    }

}

// End Of Load Functions


// Update Functions for the charts.

/// This function updates the Price Protein Chart with the new selected product Ids. Uses the Data got from the load function. No Ajax needed.
function UpdatePriceProteinChart()
{
    if(PriceProteinChart != null){
        var selectedProductIds = getSelectedProductIds();

        var XProductIds = [];
        var XAxis = [];
        var PriceYAxis = [];
        var ProteinYAxis = [];
        for(var i in PriceProteinData){
            var productData = PriceProteinData[i];

            if(selectedProductIds.includes(productData.ProductId) && productData.Price <= priceFilter){
                XProductIds.push(productData.ProductId);
                XAxis.push(productData.Title);
                PriceYAxis.push(productData.Price);
                ProteinYAxis.push(productData.Protein);
            }
        }

        var NewData = {
            labels: XAxis,
            datasets : 
            [
                {
                    type: 'line',
                    label: 'Price (£)',
                    data: PriceYAxis,
                    yAxisID:'PriceYAxis',
                    borderColor: 'black',
                    fill:false,
                    pointRadius: 10,
                    pointHoverRadius: 15,
                    lineTension: 0,
                    
                },
                {
                    label: 'Protein Per 100g',
                    data: ProteinYAxis,
                    backgroundColor: XProductIds.map(function(productId){
                        return ProductColours[productId];
                    }),
                    borderWidth: 1,
                    borderColor: 'grey',
                    hoverBorderColor: 'black',
                    yAxisID:'ProteinYAxis',
                }   
            ] 
        };


        PriceProteinChart.data = NewData;
        PriceProteinChart.options.scales.yAxes[1].ticks.max = parseFloat(priceFilter);

        PriceProteinChart.update();
    }
}

// End of Update Functions


// Resize Functions

/// This function gets the elements for the PriceProtein Canvas and Wrapper.
/// The div wrapper has styles applied in the dashboard css ".ChartWrapper".
/// The div is set to 100% of its area and the canvas height and width is set to the client size of that div for responsiveness.
function ResizePriceProteinChart()
{
    if(PriceProteinChart)
    {
        var canvas = document.getElementById('PriceProteinCanvas');
        var container = document.querySelectorAll("#PriceProteinChartWrapper");


        // Resize the height and width of the canvas equal to its container div "PriceProteinChartWrapper" which is set to 100% width of its area.
        canvas.width = container[0].clientWidth;
        canvas.height = container[0].clientHeight;

        //Resize the font sizes of the titles and scales.
        if (canvas.width < 500) { //Mobile
        PriceProteinChart.options.title.fontSize = 20;
        PriceProteinChart.options.scales.yAxes[0].ticks.fontSize = 14;
        PriceProteinChart.options.scales.yAxes[1].ticks.fontSize = 14;
        PriceProteinChart.options.scales.xAxes[0].ticks.fontSize = 14;
        }
        else{ //Other
            PriceProteinChart.options.title.fontSize = 24;
            PriceProteinChart.options.scales.yAxes[0].ticks.fontSize = 16;
            PriceProteinChart.options.scales.yAxes[1].ticks.fontSize = 16;
            PriceProteinChart.options.scales.xAxes[0].ticks.fontSize = 14;
        }

        PriceProteinChart.resize();
    }
}

/// Same as "ResizePriceProteinChart()".
function ResizeNutritionChart()
{
    if(NutritionChart)
    {
        var canvas = document.getElementById('NutritionCanvas');
        var container = document.querySelectorAll("#NutritionChartWrapper");
        
        // Resize the height and width of the canvas equal to its container div "NutritionChartWrapper" which is set to 100% width of its area
        canvas.width = container[0].clientWidth;
        canvas.height = container[0].clientHeight;

        //Resize the font sizes of the titles and scales and legend.
        if (canvas.width < 500) { // Mobile
            NutritionChart.options.title.fontSize = 20;
            NutritionChart.options.scales.yAxes[0].ticks.fontSize = 14;
            NutritionChart.options.scales.xAxes[0].ticks.fontSize = 14;
            NutritionChart.options.legend.labels.fontSize = 14;
        }
        else{ //Other
            NutritionChart.options.title.fontSize = 24;
            NutritionChart.options.scales.yAxes[0].ticks.fontSize = 16;
            NutritionChart.options.scales.xAxes[0].ticks.fontSize = 16;
            NutritionChart.options.legend.labels.fontSize = 16;
        }

        NutritionChart.resize();
    }
}

//End Of Resize Functions


//Colours

/// Sets the Colours of the Products from the database values.
async function SetProductColours(){
    // Get Products 
    var link = "Include/GetAllProducts.php";

    // Send Ajax GET

    $.ajax({
        url: link,
        method: "GET",
        async: false,
        success: function(data=this.responseText) {
            for(var i in data) {
                ProductColours[data[i].ProductId] = data[i].Colour;
            }
        },
        error: function(data) {
            console.log("The following error occurred when loading the product data: "    );
            console.log(data);
        }});
}

// End Of Colours


// Other Functions for FE.

/// When the user hovers over the div, open the information popup.
function togglePopup() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}

/// When the user clicks the dropdown accordion button, display the information below it.
function toggleAccordion(contentId, iconId) {
    var Content = document.getElementById(contentId);
    var Icon = document.getElementById(iconId);
    if (Content.classList.contains("show")) {
        Content.classList.remove("show");
        Content.classList.add("hide");
      Icon.innerHTML = "<i class='bi bi-caret-up-fill'></i>";
    } else { 
        Content.classList.remove("hide");
        Content.classList.add("show");
        Icon.innerHTML = "<i class='bi bi-caret-down-fill'></i>";
    }
}

/// Display the pop up overlay of the DRI information about the products when click of the button.
function toggleProductDRIPopup() {
    var Content = document.getElementById("ProductAreaPop");
    if (Content.classList.contains("show")) {
        Content.classList.remove("show");
        Content.classList.add("hide");
    } else { 
        Content.classList.remove("hide");
        Content.classList.add("show");
    }
}
