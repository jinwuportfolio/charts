//load data
var sleeping = [0.0152,0.0615,0.0786,0.2101,0.1598,0.2808,0.3163,0.5344,0.7448,1.1549,1.7511,3.2674,4.2434,7.3831,8.587,11.6884,10.8629,10.6469,8.197,8.0785,5.0152,4.6462,2.9325,2.8538,1.6453,1.4282,0.8003,0.6476,0.381,0.3712,0.2621,0.1987,0.1257,0.0701,0.0318,0.0948,0.0212,0.0328,0.0439,0.0025,0.058,0.0106,0.002,0.0319,0.0127,0.0171,0,0];

//set up default time
var start_hours = 8;

// uodate time with sliders
var USER_HOURS = start_hours;

//tooltip
var tip = d3.tip()
            .attr('class','d3-tip')
            .offset([-10,0])
            .html(function(d) {
                return d.toFixed(2)+"%";
            })

// margins and w/h
var margin = {top: 25, right: 25, bottom: 45, left: 50},
    width = 770 - margin.left - margin.right,
    height = 340 - margin.top - margin.bottom;

// scales
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .06);

var y = d3.scale.linear()
    .range([height, 0]);

//axes    
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .tickFormat(function(d) { return d.toFixed(1) + "%"; })
    .orient("left");

// set up the slider
var hoursSlider = d3.slider().min(0).max(24).stepValues(d3.range(0,25,.5)).showRange(true).value(USER_HOURS)
    .callback(brushed);

// create the SVG
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("id", "sleeping")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//call tooltip
svg.call(tip);

// set domains
x.domain(d3.range(0,25,.5));
y.domain([0, d3.max(sleeping, function(d) { return d; })]).nice();

// draw the indicator line
var indicator = svg.append("g")
    .attr("id", "indicator")
    .attr("transform", "translate("+ (x(USER_HOURS)) +", 0)");
indicator.append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", height);
indicator.append("text")
    .attr("y", 0)
    .attr("dy", -11)
    .text("You're here");

// draw bars
svg.selectAll(".bar")
      .data(sleeping)
    .enter().append("rect")
	  .attr("id", function(d,i) { return "bin" + i; })
      .attr("class", "bar")
      .attr("x", function(d,i) { return x(i * .5) + x.rangeBand(); })
      .attr("width", x.rangeBand())
	.attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height - y(d); })
      .on('mouseover',function(d) {
        tip.show(d);
      })
      .on('mouseout',function(d) {
        tip.hide(d);
      });

// draw x axis
xAxis.tickValues(x.domain().filter(function(d,i) { return !(i % 2); } ));
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .append("text")
    .attr("x", x("6"))
    .attr("y", 30)
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text("Hours per day by those engaged with activity");

// draw y axis
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// draw the baseline
svg.append("g")
    .attr("class", "baseline")
    .attr("transform", "translate(0,"+ height +")")
  .append("line")
    .attr("x1", -xAxis.tickSize())
    .attr("x2", width)
    .attr("y2", 0);

// draw the slider
d3.select("#valueslider").call(hoursSlider);

// initialize highlighted bars at 8 hours
update();

// update when slider brushed
function brushed() {
    USER_HOURS = hoursSlider.value();
    update();
}

// update the bars color
function update() {
    
    // update text value
    d3.select("#value").text(hoursInWords(USER_HOURS));
	
	// update indicator line
    d3.select("#indicator")
        .attr("transform", "translate("+ (x(USER_HOURS)+x.rangeBand()/2) +", 0)");
    
	// highlight bars
	svg.selectAll(".bar").call(highlightBars);
        
}


// highlight the bars
function highlightBars(bars) {
	// curr_total = 0;
    bars.classed("highlight", function(d,i) {
        var max_bin = 2 * USER_HOURS;
        if (i < max_bin) {
            return true;
        } else {
            return false;
        }
    });
}

// convert time into text
function hoursInWords(hours) {
    var diff = hours - Math.floor(hours);
    if (hours == 1) {
        return hours + ' hour'
    }    
    else if (diff > 0) {
        return Math.floor(hours) + " hours, 30 minutes";
    } else {
        return hours + " hours";
    }
    
}