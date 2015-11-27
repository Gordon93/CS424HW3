class ArtistForceGraph {
    private width: number;
    private height: number;
    private svg: d3.Selection<any>;
    private div: d3.Selection<any>;
    private link: d3.Selection<any>;
    private node: d3.Selection<any>;
    private force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;
    
    public constructor(id: string) {
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
        
        this.div = d3.select("#" + id).append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);
    }
    
    private fnodes = [];
    public dataArtists(artists: Object[]) {
        console.log(artists);
        
        var nodeU = this.node.data(artists, d => d["id"]);
        var div = this.div; 
        nodeU.enter()
            .append("circle")
            .each(d => this.fnodes.push({id:d["id"],name:d["name"]}))
            .attr("class", "node")
            .attr("r", 10)
            .attr("cx", (d, i) => i * 10)
            .attr("cy", (d, i) => i * 10)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "yellow")
            .call(this.force.drag)
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div.html(d["name"])	
                    .style("left", (d3.event["pageX"]) + "px")		
                    .style("top", (d3.event["pageY"] - 28) + "px");	
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
            
        this.fnodes.forEach((d, i) => d.index = i);
        //console.log(this.fnodes);            
        /*this.node
            .data(artists, d => d["id"])
            .enter().call()
            .each(d => this.fnodes.push({ id: d["id"], name: d["name"]}));
          */  
        this.force
            .linkDistance(50)
            .charge(-120)
            .gravity(0.05)
            .nodes(this.fnodes)
            //.links(dlinks)
            .start();
            
        this.force.on("tick", (evt) => {
            nodeU.attr({
                cx: d => d['x'],
                cy: d => d['y']
            });
            /*linkU.attr({
                x1: d => d.source['x'],
                y1: d => d.source['y'],
                x2: d => d.target['x'],
                y2: d => d.target['y'],
            });*/
        });        
    }
}

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
