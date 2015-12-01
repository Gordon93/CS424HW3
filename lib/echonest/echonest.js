var echonest;
(function (echonest) {
    var ECHONEST_API = "http://developer.echonest.com/api/v4";
    var ECHONEST_KEY = "7EPUF3TJXQEUWJB0Z";
    var Bucket = (function () {
        function Bucket(value) {
            this.value = value;
        }
        Bucket.prototype.toString = function () { return this.value; };
        Bucket.biographies = new Bucket("biographies");
        Bucket.blogs = new Bucket("blogs");
        Bucket.discovery = new Bucket("discovery");
        Bucket.discovery_rank = new Bucket("discovery_rank");
        Bucket.doc_counts = new Bucket("doc_counts");
        Bucket.familiarity = new Bucket("familiarity");
        Bucket.familiarity_rank = new Bucket("familiarity_rank");
        Bucket.genre = new Bucket("genre");
        Bucket.hotttnesss = new Bucket("hotttnesss");
        Bucket.hotttnesss_rank = new Bucket("hotttnesss_rank");
        Bucket.images = new Bucket("images");
        Bucket.artist_location = new Bucket("artist_location");
        Bucket.news = new Bucket("news");
        Bucket.reviews = new Bucket("reviews");
        Bucket.songs = new Bucket("songs");
        Bucket.terms = new Bucket("terms");
        Bucket.urls = new Bucket("urls");
        Bucket.video = new Bucket("video");
        Bucket.years_active = new Bucket("years_active");
        return Bucket;
    })();
    echonest.Bucket = Bucket;
    var ArtistSearchSort = (function () {
        function ArtistSearchSort(value) {
            this.value = value;
        }
        ArtistSearchSort.prototype.toString = function () { return this.value; };
        ArtistSearchSort.familiarity_asc = new ArtistSearchSort("familiarity-asc");
        ArtistSearchSort.hotttnesss_asc = new ArtistSearchSort("hotttnesss-asc");
        ArtistSearchSort.familiarity_desc = new ArtistSearchSort("familiarity-desc");
        ArtistSearchSort.hotttnesss_desc = new ArtistSearchSort("hotttnesss-desc");
        ArtistSearchSort.artist_start_year_asc = new ArtistSearchSort("artist_start_year-asc");
        ArtistSearchSort.artist_start_year_desc = new ArtistSearchSort("artist_start_year-desc");
        ArtistSearchSort.artist_end_year_asc = new ArtistSearchSort("artist_end_year-asc");
        ArtistSearchSort.artist_end_year_desc = new ArtistSearchSort("artist_end_year-desc");
        return ArtistSearchSort;
    })();
    echonest.ArtistSearchSort = ArtistSearchSort;
    function callAPI(method, params, result) {
        var url = ECHONEST_API + method + "?api_key=" + ECHONEST_KEY + "&" + $.param(params, true);
        $.getJSON(url, result).fail(function (d) { return console.log("CallAPI error: " + d); });
    }
    var Artist = (function () {
        function Artist() {
        }
        Artist.profile = function (params, result) {
            callAPI("/artist/profile", params, result);
        };
        Artist.search = function (params, result) {
            callAPI("/artist/search", params, result);
        };
        Artist.similar = function (id, result) {
            callAPI("/artist/similar", { id: id }, function (d) { return result(d.response.artists); });
        };
        Artist.topArtists = function (count, startYear, endYear, result) {
            Artist.search({
                format: "json",
                bucket: [Bucket.hotttnesss, Bucket.genre, Bucket.years_active, Bucket.artist_location],
                artist_start_year_before: endYear + 1,
                artist_start_year_after: startYear - 1,
                sort: ArtistSearchSort.hotttnesss_desc,
                results: count,
            }, function (d) { return result(d.response.artists); });
        };
        Artist.topArtistsPerDecade = function (count, startYear, endYear, result) {
            var artists = [];
            var DECADE = 10;
            var decadeStarts = d3.range(startYear, endYear, DECADE);
            function decadeDo(i) {
                if (i < decadeStarts.length) {
                    var d = decadeStarts[i];
                    artists[i] = { startYear: d, endYear: d + DECADE - 1, artists: [] };
                    echonest.Artist.topArtists(count, d, d + DECADE - 1, function (a) {
                        artists[i].artists = a;
                        decadeDo(i + 1);
                    });
                }
                else {
                    result(artists);
                }
            }
            decadeDo(0);
        };
        Artist.primaryGenre = function (artist) {
        };
        return Artist;
    })();
    echonest.Artist = Artist;
})(echonest || (echonest = {}));
//# sourceMappingURL=echonest.js.map