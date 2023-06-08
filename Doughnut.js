//Q5: Student data visualaization of vehicle data, the information chosen is left to your own discretion.

//The proportion of new private cars to new goods vehicles licensed for the first time
//New private cars vs New Good Vehicles

/*
    CA1 CSO Vehicle Data
    L00158616
    Daniel Gallagher
*/

// Creating a function to parse the CSV data
function parseCSVData(csvData) {
  // Use PapaParse library to parse the CSV data
  const parsedData = Papa.parse(csvData, {
    header: true,  // Specify that the first row contains headers
    dynamicTyping: true,  // Convert numeric values to numbers
    skipEmptyLines: true  // Skip any empty lines
  });
  // Return the parsed data as an array of objects
  return parsedData.data;
}

// Filter and aggregate the data for the specified month
function filterAndAggregateData(data, month) {
  const filteredData = data.filter(d => d.Month === month);
  let newPrivateCars = 0;
  let newGoodsVehicles = 0;

   // Loop through the filtered data
  filteredData.forEach(d => {
    if (d.Taxation_Class === 'New_Private_Cars') {
      // Update the count of new private cars
      newPrivateCars = d.VALUE;
    } else if (d.Taxation_Class === 'New Goods Vehicles') {
      // Update the count of new goods vehicles
      newGoodsVehicles = d.VALUE;
    }
  });
  /// Return an array of objects with the count of new private cars and new goods vehicles
  return [
    { type: 'New Private Cars', value: newPrivateCars },
    { type: 'New Goods Vehicles', value: newGoodsVehicles }
  ];
}

// Function to create color scale
function createColorScale(data) {
  return d3.scaleOrdinal()
    // Specify the domain of the scale as the unique categories in the data
    .domain(data.map(d => d.type))
    // Specify the range of colors for the scale
    .range(['#4e79a7', '#f28e2c']);
}

// Creating pie generator function
function createPieGenerator() {
  return d3.pie().value(d => d.value);
}

// Creating an arc generator function
function createArcGenerator(radius) {
  return d3.arc()
    .innerRadius(radius * 0.6)  // // Set the inner radius of the arc to 60% of the specified radius
    .outerRadius(radius * 0.8); // Set the outer radius of the arc to 80% of the specified radius
}

// Creating an arc generator function for the hover state
function createHoverArcGenerator(radius) {
  return d3.arc()
    .innerRadius(radius * 0.6)  
    .outerRadius(radius * 0.85);
}

// Function to create the doughnut chart
function createDoughnutChart(data) {
  const width = 600;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  const color = createColorScale(data);
  const pie = createPieGenerator();
  const arc = createArcGenerator(radius);
  const hoverArc = createHoverArcGenerator(radius);

  // Create and set up the main SVG element
  const svg = d3.select('#chart').append('svg')
    .attr('width', width)
    .attr('height', height);

  // Create and set up a group element for the arcs
  const g = svg.append('g')
    .attr('transform', `translate(${width / 3}, ${height / 2})`);

  // Create and set up the arc elements
  const arcs = g.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc');

  // Add initial transition when drawing arcs
  arcs.append('path')
    .attr('d', arc)
    .style('fill', d => color(d.data.type))
    .transition()
    .duration(1000)
    .attrTween('d', function (d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(interpolate(t));
      };
    });
  
  // Add hover transition for arcs
  arcs.on('mouseover', function (_, d) {
    d3.select(this).select('path')
      .transition()
      .duration(200)
      .attr('d', hoverArc);
  })
    .on('mouseout', function () {
      d3.select(this).select('path')
        .transition()
        .duration(200)
        .attr('d', arc);
    });

  // Add labels to the arcs
  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '.35em')
    .text(d => d.data.value);

  // Add title to the chart
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px')
    .text('New Private Cars vs New Goods Vehicles(2019-2023)');

  // Add legend to the chart
  const legend = svg.selectAll('.legend')
    .data(data)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(${(width / 2) + 50}, ${30 * (i + 1)})`);

  legend.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => color(d.type));

  legend.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .text(d => d.type);
}

// Fetch the CSV data, parse it, filter it, and create the doughnut chart
fetch('vehicles.csv')
  .then(response => response.text())
  .then(csvData => {
    const parsedData = parseCSVData(csvData);
    const aggregatedData = filterAndAggregateData(parsedData, '2019M01');
    createDoughnutChart(aggregatedData);
  })
  .catch(error => console.error('Error fetching or processing the data:', error));
