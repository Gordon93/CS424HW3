module fdg {
	export var graph : ArtistForceGraph;
	export var data : any;
	export var artists: any;
	export var genres : any;
	export var genreMap: any;
	export var dataLoaded = new LiteEvent<void>();
		
	export function init(id: string) {
		graph = new ArtistForceGraph(id);
		//fdg.addNode("a", "A");
		//fdg.addNode("b", "B");
		//fdg.addLink("a", "b");
		
		fdg.dataLoaded.on(() => {
			var artists = [].concat.apply([], data.map(d => d["artists"]));
			for (var i in artists)
				graph.addNode(artists[i]);
			
			function yearIn(y:number, s:number, e:number) {
				return y >= s && y <= e;
			}	
			//graph.highlight("user1", artists.filter(d => yearIn(d.years_active[0].start, 1950, 1959)).map(d => d.id));
			//graph.highlight("user2", artists.filter(d => d.name === "Madonna").map(d => d.id));
		});

		var fileLoaded = new LiteEvent<void>();
		fileLoaded.on(() => {
			if (fdg.data && fdg.genres && fdg.genreMap)
				fdg.dataLoaded.trigger();
		});
		
		d3.json("data/top100.json", (err, data) => {
			fdg.data = data;
			fdg.artists = [].concat.apply([], data.map(d => d.artists));
			fileLoaded.trigger();
		});
		
		d3.json("data/genres.json", (err, data) => {
			fdg.genres = data;
			fileLoaded.trigger();
		});
		
		d3.json("data/genreMap.json", (err, data) => {
			fdg.genreMap = data;
			fileLoaded.trigger();
		});
		
		var i = 1;
		$("#create").click(() => {
			graph.addNode((i++).toString());
		})
		$("#remove").click(() => {
			graph.removeNode((--i).toString());
		})
	}	
	
	interface Node {
		id: string;
		name?: string;
		index?: number;
		x?: number;
		y?: number;
		similar?: string[];
		genres?: Object[];
		primaryGenre?: string;
		year?: number;
	}
	
	interface Link {
		source: Node;
		target: Node;
	}
	
	export class ArtistForceGraph {
		private id: string;
		private width: number;
		private height: number;
		public nodes = new Array<Node>();
		private links = new Array<Link>();
	    private force: d3.layout.Force<d3.layout.force.Link<d3.layout.force.Node>, d3.layout.force.Node>;
		private div: d3.Selection<any>;
		private nodeU: d3.selection.Update<any> = null;
		private linkU: d3.selection.Update<any> = null;
		private hisel = {};
		private svg: d3.Selection<any>;
		private rootg: d3.Selection<any>;
		private gravity = 0.03;
		private charge = -60;
		private linkDist = 50;
		
		public constructor(id: string) {
			this.id = id;
			this.createSvg();
			this.createForce();
			
			this.div = d3.select(this.id).append("div")	
					.attr("class", "tooltip")				
					.style("opacity", 0);
					
			$(this.id + " svg").bind('mousewheel', (e:any) => this.zoom(e.originalEvent.wheelDelta));
		}
		
		private zoomLevel: number = 1;
		public zoom(sign: number) {
			var step = 1.1;
			if (sign > 0) this.zoomLevel *= step;
			else if (sign < 0) this.zoomLevel /= step;
			
			this.rootg.attr("transform", `translate(${this.width / 2}, ${this.height / 2}) scale(${this.zoomLevel}, ${this.zoomLevel})`);
			/*if (this.force) this.force
				.linkDistance(this.linkDist * this.zoomLevel)
            	.charge(this.charge * this.zoomLevel)
				.start();*/
		}
		
		public addNode(artist: any) {
			var newNode = <Node>{ 
				id: artist.id,
				name: artist.name,
				similar: artist.similar,
				genres: artist.genres,
				primaryGenre: datautil.primaryGenre(genreMap, artist.genres),
				year: artist.years_active[0].start
			};
			this.nodes.push(newNode);
			this.nodes.forEach((d, i) => d.index = i);
			this.syncDom();
			
			// check all friends if they point to us
			this.nodes.forEach(d => {
				if (d !== newNode) {
					if (d.similar && d.similar.indexOf(newNode.id) !== -1)
						this.addLink(newNode.id, d.id);
				}
			});
			
			// check if our new node points to others
			if (newNode.similar) {
				newNode.similar.forEach((d) => this.addLink(newNode.id, d));
			}
			else {
				echonest.Artist.similar(newNode.id, d => {
					newNode.similar = (<any>d).map(x => x.id);
					newNode.similar.forEach((d) => this.addLink(newNode.id, d));								
				});
			}
		}
		
		public removeNode(id: string) {
			var found = -1;
			this.nodes.forEach((d, i) => { d.id === name ? found = i : null; })
			if (found !== -1) {
				this.nodes.splice(found, 1);
				this.nodes.forEach((d, i) => d.index = i);
				this.syncDom();
			}
		}
		
		public addLink(n1: string, n2: string) {
			var node1 = this.findNode(n1);
			var node2 = this.findNode(n2);
			if (node1 !== null && node2 !== null) {
				this.links.push({ source: node1, target: node2 });
				this.syncDom();
			}
		}
		
		public highlight(user: string, artistIds: string[]) {
			this.hisel[user] = artistIds;
			this.updateDom();
		}
		
		private findNode(id: string) : Node {
			for (var i = 0; i < this.nodes.length; i++)
				if (this.nodes[i].id === id)
					return this.nodes[i];
			return null;
		}
		
		private createSvg() {
			var svg = d3.select(this.id).append("svg")
				.attr({"width": "100%", 
				"height": "100%"});
			this.svg = svg;
			this.rootg = svg.append("g");
			this.width = 1;
			this.height = 1;
			setTimeout(() => { this.resize(); }, 1000);
			$(window).resize(() => this.resize());
			//debugger;
			//debugger;
			/*svg.append("rect").attr({
				"x": 0, 
				"y": 0, 
				"width": width, 
				"height": height, 
				"stroke": "black", 
				"fill": "none", 
				"stroke-width": 1});
				
			this.width = width;
			this.height = height;*/
		}
		
		public resize() {
				this.width = this.svg.property("width").baseVal.value;
				this.height = this.svg.property("height").baseVal.value;
				this.zoom(0);
				//if (this.force) this.force.size([this.width, this.height]).start();
		}
		
		private createForce() {
			this.force = d3.layout.force()
            	.size([1,1]/*[this.width, this.height]*/)
            	.linkDistance(this.linkDist)
            	.charge(this.charge)
            	.gravity(this.gravity);
		}
		
		private syncDom() {
			var svg = this.rootg;
			var nodeU = svg.selectAll(".node")
				.data(this.nodes, d => d.id);
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
					"class" : "user2"
				});					
				
			g.append("circle")
	            .attr({
					"cx": 0,
					"cy": 0,
					"r": 5.25,
					"stroke": "black",
					"stroke-width": 1.5,
					"fill": d => datautil.genreColor(d.primaryGenre),
				})
				.on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(`<b>${d.name}</b><br>${capitalizeWords(d.primaryGenre)}<br><i>${d.year}</i>`)	
						.style("left", (d3.event["pageX"] + 10) + "px")		
						.style("top", (d3.event["pageY"] - 28) + "px");	
					})					
				.on("mouseout", function(d) {		
					div.transition()		
						.duration(500)		
						.style("opacity", 0);	
				});
			
			g.append("text")
				.attr("dx", 12)
				.attr("dy", ".35em")
				.text(d => d.name);	

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
			this.force.on("tick", () => { this.updateDom(); });
			this.force.start();
		}
		
		private updateDom() {
			var r = 6;
			this.nodeU.attr({
				/*cx: d => { return d.x = Math.max(r, Math.min(this.width - r, d.x)); },
				cy: d => { return d.y = Math.max(r, Math.min(this.height - r, d.y)); },*/
				"transform": d => `translate(${d.x/* = Math.max(r, Math.min(this.width - r, d.x))*/}, ${d.y /*= Math.max(r, Math.min(this.height - r, d.y))*/})`
			});
			this.linkU.attr({
				x1: d => d.source.x,
				y1: d => d.source.y,
				x2: d => d.target.x,
				y2: d => d.target.y,
			});
			
			var hisel = this.hisel;
			function usertest(user: string, id: string): boolean {
				if (!(user in hisel)) return false;
				var ids = hisel[user];
				for (var i = 0; i < ids.length; i++)
					if (ids[i] === id)
						return true;
				return false;				
			}
			
			this.nodeU.selectAll(".user1").attr({
				"stroke": "red",
				"stroke-opacity": d => usertest("user1", d.id) ? 0.3 : 0,
			});
			this.nodeU.selectAll(".user2").attr({
				"stroke": "blue",
				"stroke-opacity": d => usertest("user2", d.id) ? 0.3 : 0,
			});
		}
	}
}

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
