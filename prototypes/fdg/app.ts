/// <reference path="lib/jquery/jquery.d.ts" />
/// <reference path="lib/d3/d3.d.ts" />

$(() => {
    let g = new ForceGraph("content");

    function makeRandomGraph(): number[][] {
        let numNodes = 30;
        let numLinks = 30;
        
        function range(n: number) {
            let result: number[] = [];
            for (var i = 0; i < n; i++)
                result.push(i);
            return result;
        }

        function rand(n: number): number {
            return Math.round(Math.random() * (n - 1));
        }

        return range(numLinks).map(d => [rand(numNodes), rand(numNodes)]);
    }

    g.data(makeRandomGraph());

    let g2 = new StreamGraph("timeline");
});

class ForceGraph {
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
}

class StreamGraph {
    constructor(id: string) {
        function bumpLayer(n) {
            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }

            var a = [],
                i;
            for (i = 0; i < n; ++i) a[i] = 0;
            for (i = 0; i < 5; ++i) bump(a);
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
        let stack = d3.layout.stack().offset("wiggle");
        let layers = stack(d3.range(n).map(() => bumpLayer(m)));

        var x = d3.scale.linear()
            .domain([0, m - 1])
            .range([0, width]);
        var max = d3.max(layers, (layer) => d3.max(layer, d => d.y0 + d.y));
        var y = d3.scale.linear()
            .domain([-max, max])
            .range([height, 0]);
        var color = d3.scale.linear<string>()
            .range(["#aad", "#556"]);

        let area = d3.svg.area<d3.layout.stack.Value>().x(d => x(d.x)).y0(d => y(d.y0)).y1(d => y(d.y));
        let svg = d3.select("#" + id).append("svg");
        svg.attr("width", width);
        svg.attr("height", height);
        svg.selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", () => color(Math.random()));
    }
}
