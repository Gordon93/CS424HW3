var fdg;
(function (fdg) {
    fdg.dataLoaded = new LiteEvent();
    function init(id) {
        fdg.graph = new ArtistForceGraph(id);
        //fdg.addNode("a", "A");
        //fdg.addNode("b", "B");
        //fdg.addLink("a", "b");
        fdg.dataLoaded.on(function () {
            var artists = [].concat.apply([], fdg.data.map(function (d) { return d["artists"]; }));
            for (var i in artists)
                fdg.graph.addNode(artists[i]);
            function yearIn(y, s, e) {
                return y >= s && y <= e;
            }
            fdg.graph.highlight("user1", artists.filter(function (d) { return yearIn(d.years_active[0].start, 1950, 1959); }).map(function (d) { return d.id; }));
            fdg.graph.highlight("user2", artists.filter(function (d) { return d.name === "Madonna"; }).map(function (d) { return d.id; }));
        });
        var fileLoaded = new LiteEvent();
        fileLoaded.on(function () {
            if (fdg.data && fdg.genres && fdg.genreMap)
                fdg.dataLoaded.trigger();
        });
        d3.json("data/top100.json", function (err, data) {
            fdg.data = data;
            fdg.artists = [].concat.apply([], data.map(function (d) { return d.artists; }));
            fileLoaded.trigger();
        });
        d3.json("data/genres.json", function (err, data) {
            fdg.genres = data;
            fileLoaded.trigger();
        });
        d3.json("data/genreMap.json", function (err, data) {
            fdg.genreMap = data;
            fileLoaded.trigger();
        });
        var i = 1;
        $("#create").click(function () {
            fdg.graph.addNode((i++).toString());
        });
        $("#remove").click(function () {
            fdg.graph.removeNode((--i).toString());
        });
    }
    fdg.init = init;
    var ArtistForceGraph = (function () {
        function ArtistForceGraph(id) {
            this.nodes = new Array();
            this.links = new Array();
            this.nodeU = null;
            this.linkU = null;
            this.hisel = {};
            this.id = id;
            this.createSvg(parseInt(d3.select('#fdg').style('width'), 10), parseInt(d3.select('#fdg').style('height'), 10));
            this.createForce();
            this.div = d3.select(this.id).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }
        ArtistForceGraph.prototype.addNode = function (artist) {
            var _this = this;
            var newNode = {
                id: artist.id,
                name: artist.name,
                similar: artist.similar,
                genres: artist.genres,
                primaryGenre: datautil.primaryGenre(fdg.genreMap, artist.genres),
                year: artist.years_active[0].start
            };
            this.nodes.push(newNode);
            this.nodes.forEach(function (d, i) { return d.index = i; });
            this.syncDom();
            // check all friends if they point to us
            this.nodes.forEach(function (d) {
                if (d !== newNode) {
                    if (d.similar && d.similar.indexOf(newNode.id) !== -1)
                        _this.addLink(newNode.id, d.id);
                }
            });
            // check if our new node points to others
            if (newNode.similar) {
                newNode.similar.forEach(function (d) { return _this.addLink(newNode.id, d); });
            }
            else {
                echonest.Artist.similar(newNode.id, function (d) {
                    newNode.similar = d.map(function (x) { return x.id; });
                    newNode.similar.forEach(function (d) { return _this.addLink(newNode.id, d); });
                });
            }
        };
        ArtistForceGraph.prototype.removeNode = function (id) {
            var found = -1;
            this.nodes.forEach(function (d, i) { d.id === name ? found = i : null; });
            if (found !== -1) {
                this.nodes.splice(found, 1);
                this.nodes.forEach(function (d, i) { return d.index = i; });
                this.syncDom();
            }
        };
        ArtistForceGraph.prototype.addLink = function (n1, n2) {
            var node1 = this.findNode(n1);
            var node2 = this.findNode(n2);
            if (node1 !== null && node2 !== null) {
                this.links.push({ source: node1, target: node2 });
                this.syncDom();
            }
        };
        ArtistForceGraph.prototype.highlight = function (user, artistIds) {
            this.hisel[user] = artistIds;
            this.updateDom();
        };
        ArtistForceGraph.prototype.findNode = function (id) {
            for (var i = 0; i < this.nodes.length; i++)
                if (this.nodes[i].id === id)
                    return this.nodes[i];
            return null;
        };
        ArtistForceGraph.prototype.createSvg = function (width, height) {
            var svg = d3.select(this.id).append("svg");
            svg.attr({
                "width": width,
                "height": height
            });
            svg.append("rect").attr({
                "x": 0,
                "y": 0,
                "width": width,
                "height": height,
                "stroke": "black",
                "fill": "none",
                "stroke-width": 1 });
            this.width = width;
            this.height = height;
        };
        ArtistForceGraph.prototype.createForce = function () {
            this.force = d3.layout.force()
                .size([this.width, this.height])
                .linkDistance(50)
                .charge(-30)
                .gravity(0.03);
        };
        ArtistForceGraph.prototype.syncDom = function () {
            var _this = this;
            var svg = d3.select(this.id).select("svg");
            var nodeU = svg.selectAll(".node")
                .data(this.nodes, function (d) { return d.id; });
            var linkU = svg.selectAll(".link")
                .data(this.links);
            var div = this.div;
            var g = nodeU.enter()
                .append("g")
                .attr("class", "node")
                .call(this.force.drag);
            g.append("circle")
                .attr({
                "cx": 0,
                "cy": 0,
                "r": 10,
                "stroke": "yellow",
                "stroke-width": 10,
                "stroke-opacity": 0.0,
                "fill-opacity": 0,
                "class": "user1"
            });
            g.append("circle")
                .attr({
                "cx": 0,
                "cy": 0,
                "r": 10,
                "stroke": "yellow",
                "stroke-width": 10,
                "stroke-opacity": 0.0,
                "fill-opacity": 0,
                "class": "user2"
            });
            g.append("circle")
                .attr({
                "cx": 0,
                "cy": 0,
                "r": 5.25,
                "stroke": "black",
                "stroke-width": 1.5,
                "fill": function (d) { return datautil.genreColor(d.primaryGenre); },
            })
                .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>" + d.name + "</b><br>" + capitalizeWords(d.primaryGenre) + "<br><i>" + d.year + "</i>")
                    .style("left", (d3.event["pageX"] + 10) + "px")
                    .style("top", (d3.event["pageY"] - 28) + "px");
            })
                .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            g.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .text(function (d) { return d.name; });
            nodeU.exit()
                .remove();
            linkU.enter()
                .insert("line", ".node")
                .attr("class", "link")
                .attr("stroke", "rgba(32,32,32,.3)")
                .attr("stroke-width", "1");
            linkU.exit()
                .remove();
            this.nodeU = nodeU;
            this.linkU = linkU;
            this.force.nodes(this.nodes).links(this.links);
            this.force.on("tick", function () { _this.updateDom(); });
            this.force.start();
        };
        ArtistForceGraph.prototype.updateDom = function () {
            var _this = this;
            var r = 6;
            this.nodeU.attr({
                /*cx: d => { return d.x = Math.max(r, Math.min(this.width - r, d.x)); },
                cy: d => { return d.y = Math.max(r, Math.min(this.height - r, d.y)); },*/
                "transform": function (d) { return ("translate(" + (d.x = Math.max(r, Math.min(_this.width - r, d.x))) + ", " + (d.y = Math.max(r, Math.min(_this.height - r, d.y))) + ")"); }
            });
            this.linkU.attr({
                x1: function (d) { return d.source.x; },
                y1: function (d) { return d.source.y; },
                x2: function (d) { return d.target.x; },
                y2: function (d) { return d.target.y; },
            });
            var hisel = this.hisel;
            function usertest(user, id) {
                if (!(user in hisel))
                    return false;
                var ids = hisel[user];
                for (var i = 0; i < ids.length; i++)
                    if (ids[i] === id)
                        return true;
                return false;
            }
            this.nodeU.selectAll(".user1").attr({
                "stroke": "red",
                "stroke-opacity": function (d) { return usertest("user1", d.id) ? 0.3 : 0; },
            });
            this.nodeU.selectAll(".user2").attr({
                "stroke": "blue",
                "stroke-opacity": function (d) { return usertest("user2", d.id) ? 0.3 : 0; },
            });
        };
        return ArtistForceGraph;
    })();
    fdg.ArtistForceGraph = ArtistForceGraph;
})(fdg || (fdg = {}));
// class ArtistForceGraph {
//     private width: number;
//     private height: number;
//     private svg: d3.Selection<any>;
//     private div: d3.Selection<any>;
//     private link: d3.Selection<any>;
//     private node: d3.Selection<any>;
//     private force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;
//     public constructor(id: string) {
//         var width = 640, height = 480;
//         var svg = d3.select("#" + id).append("svg");
//         svg.attr("width", width)
//             .attr("height", height);
//         var link = svg.selectAll(".link");
//         var node = svg.selectAll(".node");
//         var force = d3.layout.force()
//             .size([width, height]);
//         this.width = width;
//         this.height = height;
//         this.svg = svg;
//         this.link = link;
//         this.node = node;
//         this.force = force;
//         this.div = d3.select("#" + id).append("div")	
//                 .attr("class", "tooltip")				
//                 .style("opacity", 0);
//     }
//     private fnodes = [];
//     public dataArtists(artists: Object[]) {
//         console.log(artists);
//         var nodeU = this.node.data(artists, d => d["id"]);
//         var div = this.div; 
//         nodeU.enter()
//             .append("circle")
//             .each(d => this.fnodes.push({id:d["id"],name:d["name"]}))
//             .attr("class", "node")
//             .attr("r", 10)
//             .attr("cx", (d, i) => i * 10)
//             .attr("cy", (d, i) => i * 10)
//             .attr("stroke", "black")
//             .attr("stroke-width", 2)
//             .attr("fill", "yellow")
//             .call(this.force.drag)
//             .on("mouseover", function(d) {		
//                 div.transition()		
//                     .duration(200)		
//                     .style("opacity", .9);		
//                 div.html(d["name"])	
//                     .style("left", (d3.event["pageX"]) + "px")		
//                     .style("top", (d3.event["pageY"] - 28) + "px");	
//                 })					
//             .on("mouseout", function(d) {		
//                 div.transition()		
//                     .duration(500)		
//                     .style("opacity", 0);	
//             });
//         this.fnodes.forEach((d, i) => d.index = i);
//         //console.log(this.fnodes);            
//         /*this.node
//             .data(artists, d => d["id"])
//             .enter().call()
//             .each(d => this.fnodes.push({ id: d["id"], name: d["name"]}));
//           */  
//         this.force
//             .linkDistance(50)
//             .charge(-120)
//             .gravity(0.05)
//             .nodes(this.fnodes)
//             //.links(dlinks)
//             .start();
//         this.force.on("tick", (evt) => {
//             nodeU.attr({
//                 cx: d => d['x'],
//                 cy: d => d['y']
//             });
//             /*linkU.attr({
//                 x1: d => d.source['x'],
//                 y1: d => d.source['y'],
//                 x2: d => d.target['x'],
//                 y2: d => d.target['y'],
//             });*/
//         });        
//     }
// }
/*class ArtistForceGraph {
    private width: number;
    private height: number;
    private svg: d3.Selection<any>;
    private link: d3.Selection<any>;
    private node: d3.Selection<any>;
    private linkU: d3.selection.Update<Object>;
    private nodeU: d3.selection.Update<Object>;
    private force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;

    constructor(id: string) {
        var width = 640, height = 480;
        var svg = d3.select("#" + id).append("svg");
        svg.attr("width", width)
            .attr("height", height);
        var link = svg.selectAll(".link");
        var node = svg.selectAll(".node");
        var force = d3.layout.force()
            .size([width, height]);

        this.width = width;
        this.height = height;
        this.svg = svg;
        this.link = link;
        this.node = node;
        this.force = force;
    }

    data(d: number[][]) {
        var nodeMap = {};

        function numToNode(i: number): Object {
            if (typeof nodeMap[i] === "undefined")
                nodeMap[i] = {};
            return nodeMap[i];
        }

        function getNodes(d: number[][]) {
            return d.reduce<[number]>((p, c) => (p.push(c[0], c[1]), p), <[number]>[])
                    .sort((a, b) => a - b)
                .filter((v, i, a) => { return i == 0 || v != a[i - 1]; })
                .map(numToNode);
        }

        function getLinks(d: number[][]) {
            return d.map((x) => { return { source: numToNode(x[0]), target: numToNode(x[1]) }; });
        }

        var dnodes = getNodes(d);
        var dlinks = getLinks(d);

        this.force
            .linkDistance(50)
            .charge(-120)
            .gravity(0.05)
            .nodes(dnodes)
            .links(dlinks)
            .start();

        var nodeU = this.node.data(dnodes);
        var linkU = this.link.data(dlinks);
        nodeU.enter().append("circle")
            .attr("class", "node")
            .attr("r", 10)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "yellow")
            .call(this.force.drag);
        nodeU.exit().remove();
        linkU.enter().insert("line", ".node")
            .attr("class", "link")
            .attr("stroke", "black")
            .attr("stroke-width", "2");
        linkU.exit().remove();

        this.nodeU = nodeU;
        this.linkU = linkU;

        this.force.on("tick", (evt) => {
            nodeU.attr({
                cx: d => d['x'],
                cy: d => d['y']
            });
            linkU.attr({
                x1: d => d.source['x'],
                y1: d => d.source['y'],
                x2: d => d.target['x'],
                y2: d => d.target['y'],
            });
        });
    }
}*/
//# sourceMappingURL=artistforcegraph.js.map