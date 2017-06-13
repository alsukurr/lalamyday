// wes, my code is SO messy! x_X

lalaApp = {};
// stroring the key in a variable
lalaApp.apiKey = '7dd794a4746b865a45d4bc6f9578a3d2';
lalaApp.apiKey2 = 'dc6zaTOxFJmzC';

var artistId;
var albumId = [];
var albumIdSelected;
var trackToDisplay = [];
var randomGIF;

lalaApp.init = function () {
	// on click get artist
	$('form').on('submit', function(e) {
		e.preventDefault();
		var artistSearch = $('input[name="artistSearch"]').val();
		lalaApp.getArtist(artistSearch);
		lalaApp.getGIF(artistSearch);
	});
	// on change get albumid and place a gif
	$('select').on('change', function() {
		// console.log($(this).val());
		albumIdSelected = $(this).val();
		lalaApp.getTrack(albumIdSelected);

		$('#gif').html(randomGIF);
	});

	// changing text on click
	$('.secret a.show').on('click', function() {
		$('#gif iframe').slideToggle('slow');
		$(this).html() == "HIDE THAT THING!" ? $(this).html('want a gif with that?') : $(this).html('HIDE THAT THING!');
	});

	// input type=text css
	$('.search input').focus(function() {
		$('.search').addClass("focused");
	})

	$('.search input').blur(function() {
		$('.search').removeClass("focused");
	});

}
// search artist
lalaApp.getArtist = function(query_artist) {
	$.ajax({
		url: 'http://api.musixmatch.com/ws/1.1/artist.search',
		dataType: 'jsonp',
		method: 'GET',
		data: {
			apikey: lalaApp.apiKey,
			format: 'jsonp',
			q_artist: query_artist,
			page_size: 100
		},
		success: function(data) {
			artistId = data.message.body.artist_list[0].artist.artist_id;
			console.log(artistId);
			lalaApp.getAlbum(artistId);

		}	
	});
}
// get gif
lalaApp.getGIF = function(query_artist) {
	$.ajax({
		url: 'http://api.giphy.com/v1/gifs/search',
		method: 'GET',
		data: {
			api_key: lalaApp.apiKey2,
			fmt: 'json',
			q: query_artist
		},
		success: function(res) {
			// console.log(res);
			lalaApp.displayGIF(res.data);
		}
	});
}
// display gif (randomize)
lalaApp.displayGIF = function(gifs) {
	console.log(gifs);

	var gifsHTML = gifs
	.map(function(gif) {
		var gifHTML = `<iframe src=${gif.embed_url} frameBorder="0"></iframe>`;
		return gifHTML;
	});
	// console.log(gifsHTML);
	randomGIF = gifsHTML[Math.floor(Math.random()*gifsHTML.length)];
}

// grab artist id and pick album
lalaApp.getAlbum = function(artistId) {
	$.ajax({
		url: 'http://api.musixmatch.com/ws/1.1/artist.albums.get',
		dataType: 'jsonp',
		method: 'GET',
		data: {
			apikey: lalaApp.apiKey,
			format: 'jsonp',
			artist_id: artistId,
			page_size: 100
		},
		success: function(res) {
			console.log(res.message.body.album_list);
			// turn this to displayAlbums to handle displaying
			lalaApp.filterAlbums(res.message.body.album_list);
				
		}	
	});
}

lalaApp.filterAlbums = function(albums) {
	// loop over the returned album objects
	// first, filter out all non album types results
	// look at each album id and check if it's repeating
	var albumsToDisplay = [];
	var albumsUnique = [];
	console.log(albums);
	albums
	.filter(function(album) {
		// filter out spaces and turn album names to upper case
		var album_name = album.album.album_name || '';
		var albumNameArray = album_name.match(/[a-z]/gi) || [];
		var albumName = albumNameArray.join('').toUpperCase();

		if(albumsUnique.indexOf(albumName) > -1) {
			return;
		}else if(album.album.album_release_type === 'Album') {
			// this is to compare
			albumsUnique.push(albumName);
			// console.log(albumsUnique);
			// this is to display
			albumsToDisplay.push({
				album_name: album.album.album_name,
				album_id: album.album.album_id 
			});
			albumId = album.album.album_id;
			// console.log(albumId);

		}
	});
	// console.log(albumsToDisplay);
	lalaApp.displayAlbums(albumsToDisplay);
}

lalaApp.displayAlbums = function(albums) {
	console.log(albums);
	// mapping to loop and create html
	var albumsHTML = albums.map(function(album) {
		var albumHTML = `
			<option value="${album.album_id}">${album.album_name}</option>
		`;
		
		return albumHTML;
	});
	$('select[name="albumSearch"]').html(albumsHTML);

}
// ALBUM.TRACKS.GET with album_id
lalaApp.getTrack = function(albumIdSelected) {
	$.ajax({
		url: 'http://api.musixmatch.com/ws/1.1/album.tracks.get',
		dataType: 'jsonp',
		method: 'GET',
		data: {
			apikey: lalaApp.apiKey,
			format: 'jsonp',
			album_id: albumIdSelected,
			page_size: 100
		},
		success: function(res) {
			lalaApp.tracks = res.message.body.track_list;
			// console.log(lalaApp.tracks);

			var randomTrack = lalaApp.tracks[Math.floor(Math.random()*lalaApp.tracks.length)];
			var trackId = randomTrack.track.track_id;
			var trackName = randomTrack.track.track_name;
			// console.log(randomTrack);
			// console.log(trackId);
			// console.log(trackName);
			trackToDisplay.push({
				track_id: randomTrack.track.track_id,
				track_name: randomTrack.track.track_name
			});
			// console.log(trackToDisplay);
			lalaApp.getLyrics(trackId);
		}

	});
		
	
}
// TRACK.SNIPPET.GET with track_id
lalaApp.getLyrics = function(trackId) {
	$.ajax({
		url: 'http://api.musixmatch.com/ws/1.1/track.snippet.get',
		dataType: 'jsonp',
		method: 'GET',
		data: {
			apikey: lalaApp.apiKey,
			format: 'jsonp',
			track_id: trackId,
			page_size: 100
		},
		success: function(res) {
			// pass on to check if .snippet_body exists
			lalaApp.displayLyrics(res.message.body.snippet);
			
		}
	});
}

lalaApp.displayLyrics = function(tracks) {
		// check if snippet_body exists and display accordingly
		if(tracks && tracks.snippet_body) {
			// return true;
			var tracksHTML = tracks.snippet_body;
			$('.result p.lyrics').html(tracksHTML);
		}else{
			$('.result p.lyrics').html('oh no! <br> no lyrics are avaiable for this song! 💩');
		}

		
}

$(function() {
	lalaApp.init();
});