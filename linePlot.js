//Q1: A Line Graph Displaying all new Registered vehicles for the past five years.

/*
    CA1 CSO Vehicle Data
    L00158616
    Daniel Gallagher
*/

// Loading the CSV data
d3.csv("vehicles.csv").then(function (data) {
    // Process and filter the data
    data = processAndFilterData(data);
    // Set the dimensions of the canvas
    var margin = {
        top: 40,
        right: 20,
        bottom: 70,
        left: 80
    },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Creating the canvas
    var svg = createCanvas(width, height, margin);

    // Add heading for the line graph
    addHeading(svg, width);

    // Set the x-axis scale
    var x = d3.scaleTime()
        .domain([new Date(2019, 0), new Date(2023, 0)]) // Set the date range for the x-axis
        .range([0, width]);

    // Add and format the x-axis
    addXAxis(svg, x, width, height, margin);

    // Set the y-axis scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.VALUE;
        })])
        .range([height, 0]);

    // Add the y-axis
    addYAxis(svg, y, height, margin);

    // Draw the line plot
    drawLinePlot(svg, data, x, y);
});

// A function to parse and filter data
function processAndFilterData(data) {
    // Filter the data to include only new vehicles in the past five years
    data = data.filter(function (d) {
        var year = d.Month.slice(0, 4);
        var month = d.Month.slice(5);
        var date = new Date(year, month - 1);
        return (d.Taxation_Class === "New_Vehicles" && date >= new Date(2018, 11));
    });

    // Convert the required columns to appropriate data types
    data.forEach(function (d) {
        // Extract year and month values from the Month column
        var year = d.Month.slice(0, 4);
        var month = d.Month.slice(5);
        // Create a new Date object from the year and month values
        d.Month = new Date(year, month - 1); // Month is zero-indexed in JavaScript Dates
        d.VALUE = +d.VALUE; // Convert VALUE to a number
    });
    return data;
}

// A function to create the canvas
function createCanvas(width, height, margin) {
    // Append the canvas to the body of the page
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    return svg;
}

// A function to add heading for the line graph
function addHeading(svg, width) {
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("New Vehicle Registrations (2019-2023)");
}

// A function to add and format the x-axis
function addXAxis(svg, x, width, height, margin) {
    var xAxis = d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(d3.timeYear.every(1)); // Show tick marks for every year
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(1000)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });

    // Add a label for the x-axis
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .text("Year");
}

// A function to add the y-axis
function addYAxis(svg, y, height, margin) {
    svg.append("g")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    // Add the y-axis to the canvas
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a label for the y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Vehicles");
}

// A function to draw the line plot
function drawLinePlot(svg, data, x, y) {
    var line = d3.line()
        .x(function (d) {
            return x(d.Month);
        })
        .y(function (d) {
            return y(d.VALUE);
        })
    var path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4c78a8")
        .attr("stroke-width", 3)
        .attr("d", line);

    // Calculate the total length of the line
    var totalLength = path.node().getTotalLength();

    // Animate the line drawing
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
}
