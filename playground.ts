// Initialization
$(() => { playground.init(); });

module playground {
	export var fdg : ArtistForceGraph;
	export var data : any;
	export var artists: any;
	export var genres : any;
	export var genreMap: any;
	export var dataLoaded = new LiteEvent<void>();
	
	var head = `
		<style>
			* {
				font-family: 'Segoe UI', sans-serif;
			}
			
			body {
				background-color: gray;
			}

			div.tooltip {	
				position: absolute;			
				text-align: left;			
				/*width: 60px;*/					
				/*height: 28px;*/					
				padding: 5px;				
				font: 12px sans-serif;		
				background: lightsteelblue;	
				border: 0px;		
				border-radius: 8px;			
				pointer-events: none;			
			}   
			
			#output .node text {
				pointer-events: none;
				font: 10px sans-serif;
			}
		</style>    
	`;
	var body = `
		<h1>Artist Force Graph</h1>
		<div id="output"></div>
		<button id="create">Create</button>
		<button id="remove">Remove</button>
	`;
	
	export function init() {
		$("head").append(head);
		$("body").append(body);
		fdg = new ArtistForceGraph("#output");
		//fdg.addNode("a", "A");
		//fdg.addNode("b", "B");
		//fdg.addLink("a", "b");
		
		playground.dataLoaded.on(() => {
			var artists = [].concat.apply([], data.map(d => d["artists"]));
			for (var i in artists)
				fdg.addNode(artists[i]);
			
			function yearIn(y:number, s:number, e:number) {
				return y >= s && y <= e;
			}	
			fdg.highlight("user1", artists.filter(d => yearIn(d.years_active[0].start, 1950, 1959)).map(d => d.id));
			fdg.highlight("user2", artists.filter(d => d.name === "Madonna").map(d => d.id));
		});

		var fileLoaded = new LiteEvent<void>();
		fileLoaded.on(() => {
			if (playground.data && playground.genres && playground.genreMap)
				playground.dataLoaded.trigger();
		});
		
		d3.json("data/top100.json", (err, data) => {
			playground.data = data;
			playground.artists = [].concat.apply([], data.map(d => d.artists));
			fileLoaded.trigger();
		});
		
		d3.json("data/genres.json", (err, data) => {
			playground.genres = data;
			fileLoaded.trigger();
		});
		
		d3.json("data/genreMap.json", (err, data) => {
			playground.genreMap = data;
			fileLoaded.trigger();
		});
		
		var i = 1;
		$("#create").click(() => {
			fdg.addNode((i++).toString());
		})
		$("#remove").click(() => {
			fdg.removeNode((--i).toString());
		})
	}
}

module playground {
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
		
		public constructor(id: string) {
			this.id = id;
			this.createSvg(800, 600);
			this.createForce();
			
			this.div = d3.select(this.id).append("div")	
					.attr("class", "tooltip")				
					.style("opacity", 0);			
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
		
		private createSvg(width: number, height: number) {
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
				"stroke-width": 1});
				
			this.width = width;
			this.height = height;
		}
		
		private createForce() {
			this.force = d3.layout.force()
            	.size([this.width, this.height])
            	.linkDistance(50)
            	.charge(-30)
            	.gravity(0.03);
		}
		
		private syncDom() {
			var svg = d3.select(this.id).select("svg");
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
				"transform": d => `translate(${d.x = Math.max(r, Math.min(this.width - r, d.x))}, ${d.y = Math.max(r, Math.min(this.height - r, d.y))})`
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