//Q2: A graph for displaying all registered vehicles in a selected Year.

/*
    CA1 CSO Vehicle Data
    L00158616
    Daniel Gallagher
*/

// Load CSV data and create dropdown selector
d3.csv("vehicles.csv").then(init);

// Initialize the chart and dropdown
function init(data) {
  // Define the years to include in the year selector dropdown
  const years = ["2019", "2020", "2021", "2022", "2023"];
  createYearSelector(years, data);

  // Set the default year to 2019
  const selectedYear = "2019";

  // Create the initial pie chart for the default year
  updateChart(selectedYear, data);
}

// Create the year selector dropdown and add event listener
function createYearSelector(years, data) {
  const yearSelector = d3.select("#year-selector");
  yearSelector.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Update the chart when the user selects a different year
  yearSelector.on("change", function () {
    const selectedYear = yearSelector.property("value");
    updateChart(selectedYear, data);
  });
}

// Function to update the pie chart based on the selected year
function updateChart(year, data) {
  // Filter the data to include only the selected year and "All Vehicles" tax class
  const filteredData = filterDataByYearAndTaxClass(year, data);

  // Generate pie chart data based on the "VALUE" column
  const pieData = generatePieData(filteredData);

  // Define the dimensions and colors of the pie chart
  const { width, height, radius, color } = getChartProperties(filteredData.length);

  // Create an SVG element for the chart and add it to the chart container
  const svg = createSvgElement(width, height);

  // Add the chart title
  addChartTitle(svg, width);

  // Create and position a group for the pie chart
  const pieGroup = createPieGroup(svg, width, height);

  // Create the pie chart using the pie data and append it to the pie group
  createPieChart(pieGroup, pieData, radius, color);

  // Create and position a group for the legend
  const legendGroup = createLegendGroup(svg, width, height, radius);

  // Create the legend using the pie data and append it to the legend group
  createLegend(legendGroup, pieData, color);
}

//A function to filter the data by year and tax class using the year and data
function filterDataByYearAndTaxClass(year, data) {
  return data.filter(d => d.Month.slice(0, 4) === year && d.Taxation_Class === "All_Vehicles");
}

//A Function to generate the pie data by using the filtered data
function generatePieData(filteredData) {
  return d3.pie()
    .sort(null)
    .value(d => d.VALUE)
    (filteredData);
}

//A function to get the chart properties using the data's length
function getChartProperties(dataLength) {
  const width = 800;
  const height = 500;
  const radius = Math.min(width, height) / 2 - 40;
  const color = d3.scaleSequential()
    .domain([0, dataLength - 1])
    .interpolator(d3.interpolateRainbow);

  return { width, height, radius, color };
}

//A function to create the SVG element using the width and height
function createSvgElement(width, height) {
  return d3.select("#chart")
    .html("") // clear previous chart
    .append("svg")
    .attr("width", width)
    .attr("height", height);
}

//A function to add the chart title using the svg and the width
function addChartTitle(svg, width) {
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Registered Vehicles by Month for Each Year");
}

//A function to create the Pie group using te SVG, width and height
function createPieGroup(svg, width, height) {
  return svg.append("g")
    .attr("transform", "translate(" + (width / 3) + "," + (height / 2 + 40) + ")");
}

//A function to create the Pie chart using the pieGroup, pieData, radius and color
function createPieChart(pieGroup, pieData, radius, color) {
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const pie = pieGroup.selectAll(".pie")
    .data(pieData)
    .enter()
    .append("g")
    .attr("class", "pie");

  pie.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "white")
    .style("stroke-width", "2px");

  // Add hover effect for each of the pie slices
  pie.on("mouseover", function (event, d) {
    d3.select(this).select("path")
      .transition()
      .duration(200)
      .attr("transform", function (d) {
        const dist = 5;
        d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
        const x = Math.sin(d.midAngle) * dist;
        const y = -Math.cos(d.midAngle) * dist;
        return "translate(" + x + "," + y + ")";
      });
  })
    .on("mouseout", function (event, d) {
      d3.select(this).select("path")
        .transition()
        .duration(200)
        .attr("transform", "translate(0,0)");
    });

  pie.append("text")
    .attr("transform", d => "translate(" + arc.centroid(d) + ")")
    .attr("text-anchor", "middle")
    .text(d => d.data.Month.slice(5, 7));
}

//A function create the LegendGroup using the svg, width, height and radius
function createLegendGroup(svg, width, height, radius) {
  return svg.append("g")
    .attr("transform", "translate(" + (2 * width / 3) + "," + (height / 2 - radius + 60) + ")");
}

//A function to create the Legend using the legendGroup, pieData and the color
function createLegend(legendGroup, pieData, color) {
  const legend = legendGroup.selectAll(".legend")
    .data(pieData)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + (20 * i) + ")");

  // Add colored squares to the legend
  legend.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d, i) => color(i));

  // Add text to the legend
  legend.append("text")
    .attr("x", 20)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(d => d.data.Month + ": " + d.data.VALUE);
}