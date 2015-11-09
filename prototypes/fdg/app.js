/// <reference path="lib/jquery/jquery.d.ts" />
/// <reference path="lib/d3/d3.d.ts" />
$(function () {
    var g = new ForceGraph("content");
    function makeRandomGraph() {
        var numNodes = 30;
        var numLinks = 30;
        function range(n) {
            var result = [];
            for (var i = 0; i < n; i++)
                result.push(i);
            return result;
        }
        function rand(n) {
            return Math.round(Math.random() * (n - 1));
        }
        return range(numLinks).map(function (d) { return [rand(numNodes), rand(numNodes)]; });
    }
    g.data(makeRandomGraph());
    var g2 = new StreamGraph("timeline");
});
var ForceGraph = (function () {
    function ForceGraph(id) {
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
    ForceGraph.prototype.data = function (d) {
        var nodeMap = {};
        function numToNode(i) {
            if (typeof nodeMap[i] === "undefined")
                nodeMap[i] = {};
            return nodeMap[i];
        }
        function getNodes(d) {
            return d.reduce(function (p, c) { return (p.push(c[0], c[1]), p); }, [])
                .sort(function (a, b) { return a - b; })
                .filter(function (v, i, a) { return i == 0 || v != a[i - 1]; })
                .map(numToNode);
        }
        function getLinks(d) {
            return d.map(function (x) { return { source: numToNode(x[0]), target: numToNode(x[1]) }; });
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
        this.force.on("tick", function (evt) {
            nodeU.attr({
                cx: function (d) { return d['x']; },
                cy: function (d) { return d['y']; }
            });
            linkU.attr({
                x1: function (d) { return d.source['x']; },
                y1: function (d) { return d.source['y']; },
                x2: function (d) { return d.target['x']; },
                y2: function (d) { return d.target['y']; },
            });
        });
    };
    return ForceGraph;
})();
var StreamGraph = (function () {
    function StreamGraph(id) {
        function bumpLayer(n) {
            function bump(a) {
                var x = 1 / (.1 + Math.random()), y = 2 * Math.random() - .5, z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            var a = [], i;
            for (i = 0; i < n; ++i)
                a[i] = 0;
            for (i = 0; i < 5; ++i)
                bump(a);
            return a.map(function (d, i) {
                return {
                    x: i,
                    y: Math.max(0, d)
                };
            });
        }
        var width = 640, height = 480;
        var m = 50;
        var n = 5;
        var stack = d3.layout.stack().offset("wiggle");
        var layers = stack(d3.range(n).map(function () { return bumpLayer(m); }));
        var x = d3.scale.linear()
            .domain([0, m - 1])
            .range([0, width]);
        var max = d3.max(layers, function (layer) { return d3.max(layer, function (d) { return d.y0 + d.y; }); });
        var y = d3.scale.linear()
            .domain([-max, max])
            .range([height, 0]);
        var color = d3.scale.linear()
            .range(["#aad", "#556"]);
        var area = d3.svg.area().x(function (d) { return x(d.x); }).y0(function (d) { return y(d.y0); }).y1(function (d) { return y(d.y); });
        var svg = d3.select("#" + id).append("svg");
        svg.attr("width", width);
        svg.attr("height", height);
        svg.selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", function () { return color(Math.random()); });
    }
    return StreamGraph;
})();
//# sourceMappingURL=app.js.map