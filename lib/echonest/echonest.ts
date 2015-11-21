module echonest {
    var ECHONEST_API = "http://developer.echonest.com/api/v4";
    var ECHONEST_KEY = "7EPUF3TJXQEUWJB0Z";

    class Bucket {
        value: string;
        constructor(value: string) { this.value = value; }
        toString(): string { return this.value; }

        static biographies = new Bucket("biographies");
        static blogs = new Bucket("blogs");
        static discovery = new Bucket("discovery");
        static discovery_rank = new Bucket("discovery_rank");
        static doc_counts = new Bucket("doc_counts");
        static familiarity = new Bucket("familiarity");
        static familiarity_rank = new Bucket("familiarity_rank");
        static genre = new Bucket("genre");
        static hotttnesss = new Bucket("hotttnesss");
        static hotttnesss_rank = new Bucket("hotttnesss_rank");
        static images = new Bucket("images");
        static artist_location = new Bucket("artist_location");
        static news = new Bucket("news");
        static reviews = new Bucket("reviews");
        static songs = new Bucket("songs");
        static terms = new Bucket("terms");
        static urls = new Bucket("urls");
        static video = new Bucket("video");
        static years_active = new Bucket("years_active");
    }
    
    class ArtistSearchSort {
        value: string;
        constructor(value: string) { this.value = value; }
        toString(): string { return this.value; }
        
		static familiarity_asc = new ArtistSearchSort("familiarity-asc");
		static hotttnesss_asc = new ArtistSearchSort("hotttnesss-asc");
		static familiarity_desc = new ArtistSearchSort("familiarity-desc");
		static hotttnesss_desc = new ArtistSearchSort("hotttnesss-desc");
		static artist_start_year_asc = new ArtistSearchSort("artist_start_year-asc");
		static artist_start_year_desc = new ArtistSearchSort("artist_start_year-desc");
		static artist_end_year_asc = new ArtistSearchSort("artist_end_year-asc");
		static artist_end_year_desc = new ArtistSearchSort("artist_end_year-desc");
    }

    export interface ArtistSearchParams {
        format?: string; // json, xml, jsonp
        bucket?: Bucket[]; // what data should be returned with each artist
        artist_location?: string; // location of interest
        name?: string; // name of artist
        description?: string; // description of artist
        genre?: string; // genre of artist eg. jazz/metal
        style?: string; // musical style eg. jazz/metal
        mood?: string; // mood like eg. happy/sad
        rank_type?: string; // search by relevance/familiarity
        fuzzy_match?: boolean; // fuzzy search
        max_familiarity?: number; // 0.0 - 1.0
        min_familiarity?: number; // 0.0 - 1.0
        max_hotttnesss?: number; // 0.0 - 1.0
        min_hotttnesss?: number; // 0.0 - 1.0
        artist_start_year_before?: number; // 1970 - 2011, present
        artist_start_year_after?: number; // 1970 - 2011, present
        artist_end_year_before?: number; // 1970 - 2011, present
        artist_end_year_after?: number; // 1970 - 2011, present
        sort?: ArtistSearchSort;
        results?: number; // 0 - 100, number of results
        start?: number; // 0, 15, 30, desired index of first result returned
    }
    
    function callAPI(method: string, params: Object, result: (data: Object) => void) {
        var url = ECHONEST_API + method + "?api_key=" + ECHONEST_KEY + "&" + $.param(params, true);
        $.getJSON(url, result);
    }

    export class Artist {
        public static search(params: ArtistSearchParams, result: (data: Object) => void) {
            callAPI("/artist/search", params, result);
        }

        public static similar(id: string, result: (data: Object) => void) {
            callAPI("/artist/similar", { id: id }, d => result((<any>d).response.artists));
        }
        
        public static topArtists(count: number, startYear: number, endYear: number, result: (data: Object) => void) {
            Artist.search({
                format: "json",
                bucket: [Bucket.hotttnesss, Bucket.genre, Bucket.years_active],
                artist_start_year_before: endYear + 1,
                artist_start_year_after: startYear - 1,
                sort: ArtistSearchSort.hotttnesss_desc,
                results: count,
            }, d => result((<any>d).response.artists));
        }
        
        public static topArtistsPerDecade(count: number, startYear: number, endYear: number, result: (data: Object) => void) { 
            var artists = [];
            
            var DECADE = 10;
            var decadeStarts = d3.range(startYear, endYear, DECADE); 
            function decadeDo(i: number) {
                if (i < decadeStarts.length) {
                    var d = decadeStarts[i];
                    artists[i] = { startYear: d, endYear: d + DECADE - 1, artists: [] };
                    echonest.Artist.topArtists(count, d, d + DECADE - 1, a => {
                        artists[i].artists = a
                        decadeDo(i + 1);
                    });
                }
                else {
                    result(artists);
                }        
            }
            decadeDo(0);
        }
    }
}