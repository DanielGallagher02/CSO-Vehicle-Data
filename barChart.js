//Q3: graph highlighting the differences in registration of private and second-hand vehicles over 
//the past five years.

/*
    CA1 CSO Vehicle Data
    L00158616
    Daniel Gallagher
*/

// Set the dimensions and margins of the graph
const margin = { top: 50, right: 70, bottom: 120, left: 100 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Initialize the SVG container
const svg = initializeSVGContainer();

// Load the data from vehicles.csv file
d3.csv("vehicles.csv").then(function (data) {
  const chartData = processData(data);
  drawChart(chartData);
});

//Initializes the SVG container and appends it to the body of the page
function initializeSVGContainer() {
  return d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
}


//A function that Processes the data, filtering, aggregating, and converting it
function processData(data) {
  // Filter, aggregate, and convert data
  const filteredData = filterFirstMonthOfYear(data);
  const aggregatedData = aggregateVehicleData(filteredData);
  return convertAggregatedDataToArray(aggregatedData);
}


//A function that filters the data to include only the first month of each year
function filterFirstMonthOfYear(data) {
  return data.filter(function (d) {
    return d.Month.endsWith("01");
  });
}

//A function aggregates the data for private and second-hand vehicles for each year
function aggregateVehicleData(data) {
  return d3.rollup(
    data,
    function (v) {
      return {
        private: d3.sum(
          v.filter(function (d) {
            return d.Taxation_Class == "New_Private_Cars";
          }),
          function (d) {
            return +d.VALUE;
          }
        ),
        secondhand: d3.sum(
          v.filter(function (d) {
            return d.Taxation_Class == "Secondhand_Private_Cars";
          }),
          function (d) {
            return +d.VALUE;
          }
        ),
      };
    },
    function (d) {
      return d.Month.substring(0, 4);
    }
  );
}


//A function that converts the aggregated data to an array of objects
function convertAggregatedDataToArray(data) {
  return Array.from(data, function (d) {
    return { year: d[0], private: d[1].private, secondhand: d[1].secondhand };
  });
}


//A function that draws the chart with the given data
function drawChart(data) {
  const x = initializeXAxis(data);
  const y = initializeYAxis(data);

  drawBars(data, x, y);
  drawLegend();
  drawTitles();
}  

//A Function that draw the chart elements on the x-axis
function initializeXAxis(data) {
  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(function (d) { return d.year; }))
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  return x;
}

//A Function that draw the chart elements on the y-axis
function initializeYAxis(data) {
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return Math.max(d.private, d.secondhand); })])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  return y;
}

//A function to draw each of the 2 bars of private and second-hand
function drawBars(data, x, y) {
  // Draw bars for private cars
  svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.year); })
    .attr("y", function (d) { return y(d.private); })
    .attr("width", x.bandwidth() / 2)
    .attr("height", 0)
    .attr("fill", "#3f88c5")
    .transition()
    .duration(1000)
    .attr("height", function (d) { return height - y(d.private); });

  // Draw bars for second-hand cars
  svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.year) + x.bandwidth() / 2; })
    .attr("y", function (d) { return y(d.secondhand); })
    .attr("width", x.bandwidth() / 2)
    .attr("height", 0)
    .attr("fill", "#e77e42")
    .transition()
    .duration(1000)
    .attr("height", function (d) { return height - y(d.secondhand); });
}

//A function for drawing the legend 
function drawLegend() {
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0," + (height + 40) + ")");

  const legendRectSize = 18;
  const legendSpacing = 4;

  const legendData = [
    { label: "New Private Cars", color: "#3f88c5" },
    { label: "SecondHand Private Cars", color: "#e77e42" }
  ];

  const legendRects = legend.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      const width = legendRectSize + legendSpacing + this.getBBox().width;
      const x = i * (width + 100);
      const y = 40;
      return "translate(" + x + "," + y + ")";
    });

  legendRects.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", function (d) { return d.color; });

    legendRects.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing)
    .text(function (d) { return d.label; })
    .style("font-size", "12px");
}

//A function for drawing the titles on the bar chart
function drawTitles() {
  // Draw the chart title
  svg.append("text")
    .attr("class", "heading")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -30)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Private Cars Licensed for the first time");

  // Draw the X-axis title
  svg.append("text")
    .attr("class", "axis-title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .text("Year (first month in each year)");

  // Draw the Y-axis title
  svg.append("text")
    .attr("class", "axis-title")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Number of Vehicles");
}  