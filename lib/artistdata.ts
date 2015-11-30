module artistdata {
	export class Artist {
		public id: string = "";
		public name: string = "";
		public hotttnesss: number = 0;
		public genre: string;
		public genres: string[] = [];
		public location: any;
		public similar: string[] = [];
		public years_active: any;
		public year: number;
	}
	
	var artists = new Array<Artist>();
	
	export function init() {
		d3.json("data/top100.json", (err, data) => {
			var araw = [].concat.apply([], data.map(d => d.artists));
			var ars = araw.map(d => {
				var a = new Artist();
				a.id = d.id;
				a.name = d.name;
				a.hotttnesss = +d.hotttnesss;
				a.genres = d.genres.map(d => d.name);
				a.location = d.artist_location;
				a.similar = d.similar;
				a.years_active = d.years_active;
				a.year = +d.years_active[0].start
				return a;
			});
			precalculateGenreWeights(ars);
			suppressChangedEvent = true;
			ars.forEach(d => {
				d.genre = primaryGenre(d.genres); 
				addArtist(d); 
			});
			suppressChangedEvent = false;
			artistsChanged.trigger();
		});
	}
	
	var suppressChangedEvent = false;
	
	export var artistAdded = new LiteEvent<Artist>();
	export var artistRemoved = new LiteEvent<string>();
	export var artistsChanged = new LiteEvent<void>();
	
	export function addArtist(artist: Artist) {
		artists.push(artist);
		artistAdded.trigger(artist);
		if (!suppressChangedEvent) artistsChanged.trigger();
	}
	
	export function removeArtist(id: string) {
		artists = artists.filter(d => d.id !== id);
		artistRemoved.trigger(id);
		if (!suppressChangedEvent) artistsChanged.trigger();
	}
	
	export function getArtists(): Artist[] {
		return artists;
	}
	
	export function getGenres(): string[] {
		return Object.keys(genreWeights);
	}
	
	export function getGenreWeights() : Object {
		return genreWeights;
	}
	
	export function fetchArtist(id: string, result: (a: Artist) => void) {
		function createArtist(d) {
			var a = new Artist();
			a.id = d.id;
			a.name = d.name;
			a.hotttnesss = +d.hotttnesss;
			a.genres = d.genres.map(d => d.name);
			a.location = d.artist_location;
			a.similar = d.similar || null;
			a.years_active = d.years_active;
			a.year = +(d.years_active[0] || {start: 1900}).start;
			d.genre = primaryGenre(a.genres); 
			return a;
		}
			
		echonest.Artist.profile({
			id: id,
			bucket: [echonest.Bucket.hotttnesss, echonest.Bucket.genre, echonest.Bucket.years_active, echonest.Bucket.artist_location],
		}, d => result(createArtist((<any>d).response.artist)));
	}
	
	var genreWeights = {};
	
	function precalculateGenreWeights(ars: Artist[]) {
		var g = {};
		[].concat.apply([], ars.map(d => d.genres)).forEach(d => g[d] = (g[d] || 0) + 1);
		genreWeights = g;
	}
	
	function primaryGenre(genres: string[]): string {
		var wg = genres.map(d => ({name: d, weight: genreWeights[d]}));
		wg.sort((a, b) => { if (a.weight !== b.weight) return b.weight - a.weight; return a.name.length - b.name.length});
		if (wg.length > 0) return wg[0].name;
		return "noname";
	}
	
	export function search(name: string, callback: (data: Object[]) => void) {
		echonest.Artist.search({name: name}, (d: any) => callback(d.response.artists));
	}
}