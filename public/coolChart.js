var dataSource = {
    datasets: [
        {
            data: [],
            backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
                '#bf2a77',
                '#bf2a2c',
                '#bc2abf'
            ]
        }
    ],
    labels: []
};

function createChart() {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: dataSource
    });
}

function getBudget() {
axios.get('http://localhost:3000/budget')
.then(function (res) {
    for (var i = 0; i < res.data.myBudget.length; i++) {
        dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
        dataSource.labels[i] = res.data.myBudget[i].title;
    }

    // Generate a mapping between the labels and the colors
    let color = d3.scale.ordinal()
        .domain(dataSource.labels)
        .range(dataSource.datasets[0].backgroundColor);


    createChart();
    createCoolerChart(res.data.myBudget, color);
});
}

getBudget();

///////////////////////////////////////////////////////////////////////////////
// Everything below this line is based on http://bl.ocks.org/dbuezas/9306799 //
///////////////////////////////////////////////////////////////////////////////

// Define the size of the SVG
const width = 475,
      height = 325,
      radius = Math.min(width, height) / 2;

// Create the SVG and the necessary containers within it
// Store a reference to the top level SVG container
let svg = d3.select("#coolChartCont")
    .append("svg")
    .append("g")

svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "labels");
svg.append("g")
    .attr("class", "lines");

let pie = d3.layout.pie()       // Create the pie chart...
    .sort(null)                 // ...without sorting the data...
    .value(function(d) {        // ...using the budget property of any data.
        return d.budget;
    });

let arc = d3.svg.arc()          // Create an arc for the pie slices...
    .outerRadius(radius * 0.8)  // ...that fills from 0.8*r units...
    .innerRadius(radius * 0.4); // ...to 0.4*r units with color.

let outerArc = d3.svg.arc()     // Create the arc for the lines...
    .innerRadius(radius * 0.9)  // ...just outside of the arc for the slices.
    .outerRadius(radius * 0.9);

// Center the top level svg container
svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Get the title for each pie wedge
let key = function(d){ return d.data.title; };

function createCoolerChart(data, color) {

    /* ------- PIE SLICES -------*/
    // Get all the slices and populate with data
    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    // Fill each pie wedge with the correct color
    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.title); })
        .attr("class", "slice");

    // Use the transition animations to correctly position the slices
    slice.transition()
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            }
        });

    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
        .data(pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.title;
        });
    
    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    // Makes sure the text is place correctly
    text.transition()
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);
    
    polyline.enter()
        .append("polyline");

    polyline.transition()
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};