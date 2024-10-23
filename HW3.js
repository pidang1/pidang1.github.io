// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });


    // Define the dimensions and margins for the SVG

    const margin = {top: 20, right:30, bottom:40, left:50};
    const width = 960 - margin.left -margin.right
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height+ margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
    .range([0, width]);

    const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.PetalWidth), d3.max(data, d => d.PetalWidth)])
    .range([height, 0]);

    // Add scales     

    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

    svg.append("g")
    .call(d3.axisLeft(yScale));

    // Add circles for each data point

    const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.Species))
    .range(d3.schemeCategory10);

    svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => xScale(d.PetalLength))
    .attr("cy", d => yScale(d.PetalWidth))
    .attr("r", 5)
    .style("fill", d => colorScale(d.Species));

    // Add x-axis label
    // Add y-axis label

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text("Petal Length");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .text("Petal Width");
  
    // Add legend
    const legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
    .attr("x", 10) 
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

    legend.append("text")
    .attr("x", 40)  
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start") 
    .text(d => d);
});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .range([height, 0]);

    // Add scales to the plot
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis and y-axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Species");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Calculate quartiles by species
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const q2 = d3.quantile(values, 0.50);  // Median
        const q3 = d3.quantile(values, 0.75);
        return { q1, q2, q3 };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw the boxplot for each species
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // 1. Draw vertical line (whiskers)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.q1 - 1.5 * (quartiles.q3 - quartiles.q1)))
            .attr("y2", yScale(quartiles.q3 + 1.5 * (quartiles.q3 - quartiles.q1)))
            .attr("stroke", "black");

        // 2. Draw box from q1 to q3
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "lightblue");

        // 3. Draw horizontal line for median (q2)
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.q2))  // Median
            .attr("y2", yScale(quartiles.q2))  // Median
            .attr("stroke", "black");
    });
});