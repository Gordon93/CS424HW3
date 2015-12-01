/**
 * Created by Ryan on 11/24/2015.
 */
var x, y1,y0,xAxis,yAxis,
    graph1,bar1,margin,height,width;
var artistList = [];
var genreList = [];
var decadeList = [];
var total = 0;


var color1 = d3.scale.category20();
var parseDate = d3.time.format("%y");


var color = d3.scale.ordinal()
    .range(["#313695","#4575b4","#74add1","#abd9e9", "#e0f3f8", "#fee090", "#fdae61", "#f46d43", "#d73027","#a50026"]);


var top10Genres = [];
var dataSet = [];
var graphs = [];

d3.csv('pythonScripts/top10GenrePerDecade.csv',function(error,data){
    if(error) {
        //if error is not null then something went wrong
        console.log(error);
    }



    var group = 1;
    data.forEach(function(d) {
        d.GROUP = group;
        d.GENRE = d.GENRE;
        d.START = +d.START;
        d.END = +d.END;
        d.HOT = parseFloat(d.HOT);
        d.NUMGENRE = parseInt(d.NUMGENRE);
        d.NUMARTIST = +d.NUMARTIST;
        total = d.NUMARTIST + total;

        if(group==10)
            group=1;
        else
            group++;


    });
    console.log(data);

    //load data to global variable usaData
    top10Genres = data;

    createbar();
    barInit(top10Genres,graphs[0].bar);
    //HLBar(top10Genres,graphs[0].bar);

});



//Function to create a line chart
function createbar() {

    //set the dimensions of the canvas/graph
    margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = parseInt(d3.select('#timeline').style('width'),10),
        width = (width - margin.left - margin.right),
        height = parseInt(d3.select('#timeline').style('height'),10)-margin.bottom - margin.top;
        //height = ((window.innerHeight) *.30)-margin.bottom - margin.top;

    console.log(width);
    console.log(height);
    //height = 270 - margin.top - margin.bottom;

    // console.log(height);

    bar1 = d3.select("#bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    graphs.push({bar:bar1});

}


function barInit(top10,graph) {
    var parseDate = d3.time.format("%y");

    x = d3.scale.ordinal().rangeRoundBands([0, width],.1,0);
    y0 = d3.scale.ordinal().rangeRoundBands([height,0],.2);
    y1 = d3.scale.linear();


    //places the x axis at the bottom of the graph
    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(5);
        //.tickFormat(parseDate);

    yAxis = d3.svg.axis()
        .scale(y0)
        .orient("left");



    var max = d3.max(top10,function (d) {return d.NUMARTIST});
    var min = d3.min(top10,function(d){return d.NUMARTIST});
    var a = 1;
    var b = 10;

    top10.forEach(function(d){
        d.NORM = (((d.NUMARTIST - (max*1000))*(b-a))/(min - (max*1000)))
    })




    var nest = d3.nest()
        .key(function(d){return d.GROUP;});

    var stack = d3.layout.stack()
        .values(function(d){return d.values; })
        .x(function (d){return d.START;})
        .y(function(d){return d.NORM;})
        .out(function(d,y0){d.valueOffset = y0;});

   // var color = d3.scale.category10();

    var dataByDecade = nest.entries(top10)
    console.log(dataByDecade);
        stack(dataByDecade);
    console.log(dataByDecade);
    //console.log(layers);



    x.domain(dataByDecade[0].values.map(function(d) {return d.START; }));
    y0.domain(dataByDecade.map(function(d){return d.key; }));
    y1.domain([0,d3.max(top10,function(d){return d.NORM;})]).range([y0.rangeBand(),0]);


    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        //.attr("font-size","12px")
        //.attr("y",0)
        .attr("x",-15);
    //.attr("dy", ".35em");
    //.attr("transform", "rotate(90)" )*/;
    var decade = graph.selectAll(".decade")
        .data(dataByDecade)
        .enter().append("g")
        .attr("class","g")
        .attr("transform","translate(0,"+ y0(y0.domain()[0])+")");

    decade.append("text")
        .attr("x",-6)
        .attr("y",function(d){return y1(d.values[0].NORM/2 + d.values[0].valueOffset);})
        .attr("dy",".35em");

    decade.selectAll("bar")
        .data(function(d){return d.values;})
        .enter().append("rect")
        .style("fill",function(d){return datautil.genreColor(d.GENRE);})
        .attr("class","relative")
        .attr("x",function(d){return x(d.START)})
        .attr("y",function(d){return y1(d.NORM + d.valueOffset);})
        .attr("width", x.rangeBand())
        .attr("height", function(d) { return y0.rangeBand() - y1(d.NORM); })
        .on("mouseover",function(d){showPopover.call(this,d);})
        .on("mouseout",function(d){removePopovers();});

    /*decade.filter(function(d,i){return !i;}).append("g")
        .attr("class","x axis")
        .attr("transfomrm","translate(0,"+ y0.rangeBand()+")")
        .call(xAxis);*/


}

function genreUpdate(user){
    //console.log(user);
    var size = genreList.length;
    //console.log(size);
    if(size>0){
        index = -1;
        i = 0;
        //var index = genreList.indexOf(user.id);
        genreList.forEach(function(d){
            //console.log(user.id);
          if(d.id==user.id){
              index = i;
          }
            i++;

        });
        //console.log(index);
        //console.log("here\n");
        if(user.bool==true) {
            console.log("bool is false\n");
            if(index>=0) {
                genreList.splice(index, 1);
                genreList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }

            if (index == -1) {
                genreList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }
        }
        else if(user.bool==false){
            //console.log("in false\n");
            genreList.splice(index, 1);
            //HLBar(top10Genres,graphs[0].bar);
         }
        }
    else if(user.bool!=false){
        genreList.push(user);
        //HLBar(top10Genres,graphs[0].bar);
        }
    console.log(genreList);
}

function getGenre(user){
    var genre = artistdata.getArtists().filter(function(a)
    {
        if(a.name !== user.artist)
            return false;
        return true;
    }).map(function (a) { return a; });
    console.log(genre);
    user.genres = genre[0].genres
    user.genre = genre[0].genre;
    user.years = genre[0].years_active;
    console.log(user);

    artistUpdate(user);


}

function artistUpdate(user){
    //console.log(user);
    var size = artistList.length;
    //console.log(size);
    if(size>0){
        index = -1;
        i = 0;
        //var index = genreList.indexOf(user.id);
        artistList.forEach(function(d){
            //console.log(user.id);
            if(d.id==user.id){
                index = i;
            }
            i++;

        });
        //console.log(index);
        //console.log("here\n");
        if(user.bool==true) {
            console.log("bool is false\n");
            if(index>=0) {
                artistList.splice(index, 1);
                artistList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }

            if (index == -1) {
                artistList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }
        }
        else if(user.bool==false){
            //console.log("in false\n");
            artistList.splice(index, 1);
            //HLBar(top10Genres,graphs[0].bar);
        }
    }
    else if(user.bool!=false){
        artistList.push(user);
        //HLBar(top10Genres,graphs[0].bar);
    }
    console.log(artistList);
}
function decadeUpdate(user){
    //console.log(user);
    var size = decadeList.length;
    //console.log(size);
    if(size>0){
        index = -1;
        i = 0;
        //var index = genreList.indexOf(user.id);
        decadeList.forEach(function(d){
            //console.log(user.id);
            if(d.id==user.id){
                index = i;
            }
            i++;

        });
        //console.log(index);
        //console.log("here\n");
        if(user.bool==true) {
            console.log("bool is false\n");
            if(index>=0) {
                decadeList.splice(index, 1);
                decadeList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }

            if (index == -1) {
                decadeList.push(user);
                //HLBar(top10Genres,graphs[0].bar);
            }
        }
        else if(user.bool==false){
            //console.log("in false\n");
            decadeList.splice(index, 1);
            //HLBar(top10Genres,graphs[0].bar);
        }
    }
    else if(user.bool!=false){
        decadeList.push(user);
        //HLBar(top10Genres,graphs[0].bar);
    }

}


function HLBar(top10,graph){
    graph.selectAll("*").remove();

    var parseDate = d3.time.format("%y");

    x = d3.scale.ordinal().rangeRoundBands([0, width],.1,0);
    y0 = d3.scale.ordinal().rangeRoundBands([height,0],.2);
    y1 = d3.scale.linear();


    //places the x axis at the bottom of the graph
    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(5);
    //.tickFormat(parseDate);

    yAxis = d3.svg.axis()
        .scale(y0)
        .orient("left");



    var max = d3.max(top10,function (d) {return d.NUMARTIST});
    var min = d3.min(top10,function(d){return d.NUMARTIST});
    var a = 1;
    var b = 10;

    top10.forEach(function(d){
        d.NORM = (((d.NUMARTIST - (max*1000))*(b-a))/(min - (max*1000)))
        d.HL =true;
        d.shared = false;
    })

    if(genreList!=[]){
        genreList.forEach(function(f){
            console.log(f);
            top10.forEach(function(d){
                //console.log(d);
                if(d.GENRE== f.genre){
                    d.shared = true;
                    d.HL = true;
                }
              else if(d.GENRE!= f.genre&& d.HL==true&& d.shared==0)
                  d.HL = false;
            })
        })

    }
    console.log(top10);
    if(decadeList!=[]){
        decadeList.forEach(function(f){
            top10.forEach(function(d){
                if(d.START==f.decade){
                    d.shared = true;
                    d.HL = true;
                }
                else if(f.decade!= d.START&&d.HL==true&&d.shared==false){
                    d.HL=false;
                }
            })

        })


    }

    if(artistList!=[]){
        artistList.forEach(function(f) {

            genre = f.genre;
            top10.forEach(function (d) {
                if(d.GENRE ==genre){
                    d.shared = true;
                    d.HL = true;
                }

                else if (genre != d.GENRE && d.HL == true&& d.shared==false) {
                    d.HL = false;
                }
            })

        })

    }




    var nest = d3.nest()
        .key(function(d){return d.GROUP;});

    var stack = d3.layout.stack()
        .values(function(d){return d.values; })
        .x(function (d){return d.START;})
        .y(function(d){return d.NORM;})
        .out(function(d,y0){d.valueOffset = y0;});

    // var color = d3.scale.category10();

    var dataByDecade = nest.entries(top10)
    console.log(dataByDecade);
    stack(dataByDecade);
    console.log(dataByDecade);
    //console.log(layers);



    x.domain(dataByDecade[0].values.map(function(d) {return d.START; }));
    y0.domain(dataByDecade.map(function(d){return d.key; }));
    y1.domain([0,d3.max(top10,function(d){return d.NORM;})]).range([y0.rangeBand(),0]);

    color1 = d3.scale.linear()
        .domain([0,2])
        .range(["#f2efef", "#dbdada", "#d0caca", "#bfb4b4", "#9c9191", "#7a6b6b", "#575757","#3b3b3b","#1f1f1f"]);


    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        //.attr("font-size","12px")
        //.attr("y",0)
        .attr("x",-15);
    //.attr("dy", ".35em");
    //.attr("transform", "rotate(90)" )*/;
    var decade = graph.selectAll(".decade")
        .data(dataByDecade)
        .enter().append("g")
        .attr("class","g")
        .attr("transform","translate(0,"+ y0(y0.domain()[0])+")");

    decade.append("text")
        .attr("x",-6)
        .attr("y",function(d){return y1(d.values[0].NORM/2 + d.values[0].valueOffset);})
        .attr("dy",".35em");

    decade.selectAll("bar")
        .data(function(d){return d.values;})
        .enter().append("rect")
        .style("fill",function(d){
            if(d.HL==true)
              return datautil.genreColor(d.GENRE);
            else
              return color1(d.GROUP);

        })
        .attr("class","relative")
        .attr("x",function(d){return x(d.START)})
        .attr("y",function(d){return y1(d.NORM + d.valueOffset);})
        .attr("width", x.rangeBand())
        .attr("height", function(d) { return y0.rangeBand() - y1(d.NORM); })
        .on("mouseover",function(d){showPopover.call(this,d);})
        .on("mouseout",function(d){removePopovers();});

    /*decade.filter(function(d,i){return !i;}).append("g")
     .attr("class","x axis")
     .attr("transfomrm","translate(0,"+ y0.rangeBand()+")")
     .call(xAxis);*/




}

function removePopovers(){
    $('.popover').each(function(){
        $(this).remove();
    })
}

function showPopover(d){
    $(this).popover({
        Genre: d.GENRE,
        placement:'auto top',
        container: 'body',
        trigger: 'manual',
        html:true,
        content:function(){
            return "GENRE:"+ d.GENRE+
                "<br/>Decade:"+ d.START +"-"+ d.END+
                "<br/>HOTTTNESS:"+ d.HOT +
                    "<br/>#Artist:"+d.NUMARTIST;}
    });
    $(this).popover('show')
}