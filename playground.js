// Initialization
$(function () { playground.init(); });
var playground;
(function (playground) {
    playground.dataLoaded = new LiteEvent();
    var head = "\n\t\t<style>\n\t\t\t* {\n\t\t\t\tfont-family: 'Segoe UI', sans-serif;\n\t\t\t}\n\t\t\t\n\t\t\tbody {\n\t\t\t\tbackground-color: gray;\n\t\t\t}\n\n\t\t\tdiv.tooltip {\t\n\t\t\t\tposition: absolute;\t\t\t\n\t\t\t\ttext-align: left;\t\t\t\n\t\t\t\t/*width: 60px;*/\t\t\t\t\t\n\t\t\t\t/*height: 28px;*/\t\t\t\t\t\n\t\t\t\tpadding: 5px;\t\t\t\t\n\t\t\t\tfont: 12px sans-serif;\t\t\n\t\t\t\tbackground: lightsteelblue;\t\n\t\t\t\tborder: 0px;\t\t\n\t\t\t\tborder-radius: 8px;\t\t\t\n\t\t\t\tpointer-events: none;\t\t\t\n\t\t\t}   \n\t\t\t\n\t\t\t#output .node text {\n\t\t\t\tpointer-events: none;\n\t\t\t\tfont: 10px sans-serif;\n\t\t\t}\n\t\t</style>    \n\t";
    var body = "\n\t\t<h1>Artist Force Graph</h1>\n\t\t<div id=\"output\"></div>\n\t\t<button id=\"create\">Create</button>\n\t\t<button id=\"remove\">Remove</button>\n\t";
    function init() {
        $("head").append(head);
        $("body").append(body);
        playground.fdg = new playground.ArtistForceGraph("#output");
        //fdg.addNode("a", "A");
        //fdg.addNode("b", "B");
        //fdg.addLink("a", "b");
        playground.dataLoaded.on(function () {
            var artists = [].concat.apply([], playground.data.map(function (d) { return d["artists"]; }));
            for (var i in artists)
                playground.fdg.addNode(artists[i]);
            function yearIn(y, s, e) {
                return y >= s && y <= e;
            }
            playground.fdg.highlight("user1", artists.filter(function (d) { return yearIn(d.years_active[0].start, 1950, 1959); }).map(function (d) { return d.id; }));
            playground.fdg.highlight("user2", artists.filter(function (d) { return d.name === "Madonna"; }).map(function (d) { return d.id; }));
        });
        var fileLoaded = new LiteEvent();
        fileLoaded.on(function () {
            if (playground.data && playground.genres && playground.genreMap)
                playground.dataLoaded.trigger();
        });
        d3.json("data/top100.json", function (err, data) {
            playground.data = data;
            playground.artists = [].concat.apply([], data.map(function (d) { return d.artists; }));
            fileLoaded.trigger();
        });
        d3.json("data/genres.json", function (err, data) {
            playground.genres = data;
            fileLoaded.trigger();
        });
        d3.json("data/genreMap.json", function (err, data) {
            playground.genreMap = data;
            fileLoaded.trigger();
        });
        var i = 1;
        $("#create").click(function () {
            playground.fdg.addNode((i++).toString());
        });
        $("#remove").click(function () {
            playground.fdg.removeNode((--i).toString());
        });
    }
    playground.init = init;
})(playground || (playground = {}));
var playground;
(function (playground) {
    var ArtistForceGraph = (function () {
        function ArtistForceGraph(id) {
            this.nodes = new Array();
            this.links = new Array();
            this.nodeU = null;
            this.linkU = null;
            this.hisel = {};
            this.id = id;
            this.createSvg(800, 600);
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
                primaryGenre: datautil.primaryGenre(playground.genreMap, artist.genres),
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
    playground.ArtistForceGraph = ArtistForceGraph;
})(playground || (playground = {}));
//# sourceMappingURL=playground.js.map