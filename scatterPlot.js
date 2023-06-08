//Q4: A Scatter plot graph of tractor registrations per month

/*
    CA1 CSO Vehicle Data
    L00158616
    Daniel Gallagher
*/

// Setting the dimensions and margins of the scatterPlot
const margin = { top: 50, right: 150, bottom: 100, left: 70 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Create the SVG container
const svg = createSvgContainer("#scatter-plot", width, height, margin);

// Load the data from the CSV file
d3.csv("vehicles.csv").then((data) => {
    const tractorData = prepareData(data);
    const { x, y } = createScales(tractorData, width, height);
    createAxes(svg, x, y, width, height);
    createScatterPlot(svg, tractorData, x, y);
    createTitles(svg, width, height);
    createLegend(svg, width);
});

// A function that creates an SVG container for the scatter plot graph and returns it
function createSvgContainer(containerId, width, height, margin) {
    return d3
        .select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
}

// A function that prepares the data for the scatter plot graph by parsing the Month and 
// VALUE columns and filtering to include only tractor registrations per month
function prepareData(data) {
    // Parse the Month and VALUE columns
    data.forEach((d) => {
        d.Month = d3.timeParse("%YM%m")(d.Month);
        d.VALUE = +d.VALUE;
    });

    // Filter the data to only include tractor registrations per month
    return data.filter((d) => d.Taxation_Class === "New_Tractors" || d.Taxation_Class === "Secondhand_Tractors");
}

//A function that creates the x-axis and y-axis scales for the scatter plot graph and returns them
function createScales(tractorData, width, height) {
    // Create the x-axis scale (time scale for months)
    const x = d3
        .scaleTime()
        .domain(d3.extent(tractorData, (d) => d.Month))
        .range([0, width]);

    // Create the y-axis scale (linear scale for number of registrations)
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(tractorData, (d) => d.VALUE)])
        .range([height, 0]);

    return { x, y };
}

//A function that creates and adds the x-axis and y-axis to the SVG container
function createAxes(svg, x, y, width, height) {
    // Create and add the x-axis to the SVG
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%Y-%m")).tickSize(-height).tickPadding(10))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Create and add the y-axis to the SVG
    svg.append("g").call(d3.axisLeft(y).tickSize(-width).tickPadding(10));
}

//A function that creates the scatter plot graph by adding circles for each data point and animates them
function createScatterPlot(svg, tractorData, x, y) {
    // Create the scatter plot by adding circles for each data point
    const circles = svg
        .selectAll("circle")
        .data(tractorData)
        .join("circle")
        .attr("cx", (d) => x(d.Month))
        .attr("cy", (d) => y(d.VALUE))
        .attr("r", 0) // Set initial radius to 0
        .style("fill", (d) => (d.Taxation_Class === "New_Tractors" ? "#1f77b4" : "#ff7f0e"));

    // Transition for circles
    circles.transition()
        .duration(1000)
        .delay((d, i) => i * 20) // Apply a delay based on the index of the data point
        .attr("r", 4); // Final radius of each data point on the scatterplot
}

//A function that creates and adds the title and axis titles to the SVG container
function createTitles(svg, width, height) {
    // Add the scatterplot title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Tractor Registrations Per Month");

    // Add the x-axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .text("Months");

    // Add the y-axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .text("Number of Registrations");
}

//A function that creates and adds the legend to the SVG container
function createLegend(svg, width) {
    // Adding the legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(["New_Tractors", "Secondhand_Tractors"])
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d) => (d === "New_Tractors" ? "#1f77b4" : "#ff7f0e"));

    legend.append("text")
        .attr("x", width + 45)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text((d) => d);
}
