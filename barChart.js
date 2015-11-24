/**
 * Created by Ryan on 11/24/2015.
 */
var x, y, xAxis,yAxis,
    graph1,bar1,margin,height,width;


var color1 = d3.scale.category20();

//parse the date
var format = d3.time.format("%y");

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


var top10Genres = [];
var dataSet = [];
var graphs = [];

d3.csv('pythonScripts/top10GenrePerDecade.csv',function(error,data){
    if(error) {
        //if error is not null then something went wrong
        console.log(error);
    }




    data.forEach(function(d) {
        d.START = parseInt(d.START)
        d.END = parseInt(d.END);
        d.HOT = parseFloat(d.HOT);
        d.NUMGENRE = parseInt(d.NUMGENRE);
        d.NUMARTIST = parseInt(d.NUMARTIST);

    });

    dataSet = d3.nest()
        .key(function(d) {
            return d.START;})
        .entries(data)

    console.log(dataSet);

    //load data to global variable usaData
    top10Genres = dataSet;

    createbar();
    barInit(top10Genres,graphs[0].bar);

});








//Function to create a line chart
function createbar() {

    //set the dimensions of the canvas/graph
    margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = parseInt(d3.select('#bar').style('width'),10),
        width = (width - margin.left - margin.right),
        height = ((window.innerHeight) *.30)-margin.bottom - margin.top;
    console.log(width);
    //height = 270 - margin.top - margin.bottom;

    // console.log(height);

    bar1 = d3.select("#bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    graphs.push({bar:bar1});

}


function barInit(top10,graph) {
    var tickF;
    x = d3.scale.ordinal().rangeRoundBands([0, width],.3);
    y = d3.scale.linear().range([height, 0]);



    if(width< 400)
        tickF = d3.time.format("%y");
    else
        tickF = d3.time.format("%Y");

    //places the x axis at the bottom of the graph
    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(5)
        .tickFormat(tickF);

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");



    var top10PerYear = [];
    //console.log(HurrData);





    /* color1 = d3.scale.linear()
     .domain([0,10])
     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);*/

    /*    color.domain(d3.keys(stateData_Array[0]).filter(function(key) { return key !== "STATE" && key !=="POP" }));


     stateData_Array.forEach(function(d) {

     x0 = x0+1;
     d.name = color.range().map(function(name) { return {name: name, x0: x0-1, x1: x0 = +d[name]}; });

     //console.log(d);
     });*/
   color.domain(d3.keys(top10[0]).filter(function(key){
        console.log(key);
        return key=="NUMARTIST"}))
    console.log(color);
    top10.forEach(function(d){
      var y0 = 0;



    });
    console.log("here1");

    x.domain(top10.map(function(d) {return parseInt(d.key); }));

    y.domain([0, d3.max(top10,function(d){
        d.values.forEach(function(d){return d.NUMARTIST;})
        })]);

    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .style("font-size","1vh")
        //.attr("y",0)
        .attr("x",-15);
    //.attr("dy", ".35em");
    //.attr("transform", "rotate(90)" )*/;
    graph.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .style("font-size","1vv")
        .attr("transform", "rotate(-90)")
        .attr("y",6)
        .attr("dy", ".71em")
        .style("text-anchor","end");
    var year = svg.selectAll(".year")
        .data(top10)
        .enter().append("g")
        .attr("class","g")
        .attr("transform",function(d){return "translate("+x(d.START)+",0)";});

    year.selectAll("bar")
        .data(function(d){return d.NUMARTIST})
        .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.perYear); })
        .attr("height", function(d) { return height - y(d.perYear); })
        .style("fill",  function (d) {
            return color1(d.GENRE);});
    graph.append("text")
        .attr("x",(width/2))
        .attr("y",10-(margin.top/2))
        .attr("text-anchor","middle")
        .style("font-size","2vh")
        .text("By Year");

}

