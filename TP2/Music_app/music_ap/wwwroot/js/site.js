// Write your JavaScript code.
function myFunction() {
    // Declare variables 
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    tr2 = table.getElementsByClassName("album-grids");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


$(document).ready(function () {
    $('#myTable tbody').empty();
    //loadTrack();
    //myFunction();

    /******************************Deezer load************************************/
    //$("#player-play").click(DZ.player.play);
    //$("#player-pause").click(DZ.player.pause);
    //$("#player-slider").click(sliderClicked);
   

    DZ.init({
        appId: '118825',
        channelUrl: 'http://vladimir.sh/playground/deezer_light/channel.html',
        player: {
        }
    });

    DZ.Event.subscribe('player_position', function (e) {
        time_current = e[0];
        if (e[1])
            time_total = +e[1];
        var width = (time_current / time_total * 100) + '%';
        $("#player-progress").css("width", width);
    });

    DZ.Event.subscribe('player_loaded', function () {
        DZ.getLoginStatus(function (response) {
            if (response.authResponse) {
                console.log('logged');
            } else {
                console.log('not logged');
            }
        }, { scope: 'manage_library,basic_access' });
    })

    $("#search").click(function () {
        $('#myTable tbody').empty();
        launchSearch();
        SearchTrackSpotify();
       
    });
    //localStorage.setItem('loggedIn', true);
    if (localStorage.getItem("loggedIn")) {
        console.log("connecte");
        $("#loginDiv").hide();
        $(".albums").show();
    }
    else {
        $("#loginDiv").show();
        $(".albums").hide();
    }

    /*Deezer*/
    function launchSearch() {
        //$("#results").html('');
        //$('#myTable tbody').empty();
        DZ.api('/search/track?q=' + encodeURIComponent($("#query").val()), function (response) {
            console.log('search response: ', response.data);
            response.data.slice(0, 20).forEach(function (song) {
                ///var $li = $('<li><a>' + song.artist.name + ' - ' + song.title + '</a></li>');
               // $li.click(function () { playSong(song); });

                $('#myTable tbody').append(' <tr><td>' + " " + song.title +

                    '<div onclick="" class="album-grid"' + '<div class="album-grid-info">' +
                    '<img src="http://localhost:8888/images/deezer.png"/>' +
                    '<p><strong>Artist:</strong>' + " " + song.artist.name + '</p>' +
                    '<p><strong>Album:</strong>' + " " + song.album + '</p>' +
                    '<p><strong>Date:</strong>' + " " + song.year + '</p>' +
                    '<a class="download-album" href="#">Play</a>' +
                    '</div>' +
                    '</div>' +
                    '</td >' +
                    '</tr >');
                //$("#results").append($li);
            });
        });
    }
    
    /*Spotify*/
    function SearchTrackSpotify() {

        var TrackInfo = [//{
        //    "title": "hello",
        //    "artist": "lionel richie",
        //    "album": "lionel richie Album",
        //    "year": "1990"
        //},
        //{
        //    "title": "Thriller",
        //    "artist": "Michael Jackson",
        //    "album": "Michael Jackson Album",
        //    "year": "1993"
        //}
        ];

        //if (access_token) {
        if ($("#query").val() != null) {
            //$('#myTable tbody').empty();
            searchSong(0, $("#query").val());
            //TrackInfo = searchSong(0, $("#query").val());
        }
        //console.log("MA LISTEEEE : ");
        //console.log(TrackInfo);
        //console.log("APRES MA LISTE!");

    }
   
    //(function () {
        //Client Secret ad1d7d1ee8114aa6950e8274e59fe49b
     
    function login(callback) {
            var CLIENT_ID = '6571b9fccdd5457b92ad839a17b6fa60';
            var REDIRECT_URI = 'http://localhost:8888/';
            function getLoginURL(scopes) {
                isLogged = true;
                return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
                    '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                    '&scope=' + encodeURIComponent(scopes.join(' ')) +
                    '&response_type=token';

            }

            var url = getLoginURL([
                'user-read-email'
            ]);

            this.window.addEventListener("message", function (event) {
                var hash = JSON.parse(event.data);
                if (hash.type == 'access_token') {
                    callback(hash.access_token);
                }
            }, false);

            ////var w = window.open(url,
            //    'Spotify',
            //    'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + this.width + ', height=' + this.height + ', top=' + this.top + ', left=' + this.left
            //);
           
            localStorage.setItem('loggedIn', true);
            window.location.replace(url,
                'Spotify'
            );
            
        }

    function getUserData(accessToken) {
            return $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
        }

       // var templateSource = document.getElementById('result-template').innerHTML,
        //var template = Handlebars.compile(templateSource),
        //    resultsPlaceholder = document.getElementById('result'),
        var loginButton = document.getElementById('btn-login');

        loginButton.addEventListener('click', function () {
            login(function (accessToken) {
                getUserData(accessToken)
                    .then(function (response) {
                        loginButton.style.display = 'none';
                        resultsPlaceholder.innerHTML = template(response);
                       
                    });
            });
           
        });

   // })();

 
           /**** Recherche spotify ***/
            /**
                * Obtains parameters from the hash of the URL
                * return Object
                */
            function getHashParams() {
                var hashParams = {};
                var e, r = /([^&;=]+)=?([^&;]*)/g,
                    q = window.location.hash.substring(1);
                while (e = r.exec(q)) {
                    hashParams[e[1]] = decodeURIComponent(e[2]);
                }
                return hashParams;
            }

            var params = getHashParams();

            var access_token = params.access_token,
                refresh_token = params.refresh_token,
                error = params.error;



            var Song = {
                title: "",
                artist: "",
                album: "",
                year: "",
                id: "",
                href: ""
            };

            SearchField = {
                TITLE: 0,
                ALBUM: 1
            }
            
            function searchSong(songType, value) {
                var mySongList = [];
                if (songType == SearchField.TITLE) {
                    if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=' + value + '&type=track&limit=20',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    for (var i = 0; i < response.tracks.items.length; i++) {
                        var mySong = {
                            title: response.tracks.items[i].name,
                            artist: response.tracks.items[i].artists[0].name,
                            album: response.tracks.items[i].album.name,
                            //year: response.tracks.items[i],
                            id: response.tracks.items[i].id,
                            href: response.tracks.items[i].href
                        };
                        mySongList.push(mySong);
                    }
                    //console.log(mySongList[0].artist);
                    //$('#myTable tbody').empty();
                    for (var i = 0; i < mySongList.length; i++) {
                        $('#myTable tbody').append(' <tr><td>' + " " + mySongList[i].title + 
                          
                            '<div onclick="" class="album-grid"' + '<div class="album-grid-info">' +
                            '<img src="http://localhost:8888/images/spotify.png"/>' +
                            '<p><strong>Artist:</strong>' + " " + mySongList[i].artist + '</p>' +
                            '<p><strong>Album:</strong>' + " " + mySongList[i].album + '</p>' +
                            '<p><strong>Date:</strong>' + " " + mySongList[i].year + '</p>' +
                            '<a class="download-album" href="#">Play</a>' +
                            '</div>' +
                            '</div>' +
                            '</td >' +
                            '</tr >');
                    }
                    //return mySongList;
                }
            })
        }
        }
                else if (songType == SearchField.ALBUM) {
                    if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=' + value + '&type=album&limit=20',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    console.log(response);
                    for (var i = 0; i < response.albums.items.length; i++) {
                        var mySong = {
                            title: response.albums.items[i].name,
                            artist: response.albums.items[i].artists[0].name,
                            album: response.albums.items[i].album_type,
                            //year: response.albums.items[i],
                            id: response.albums.items[i].id,
                            href: response.albums.items[i].href
                        };
                        mySongList.push(mySong);
                    }
                }
            })
        }
        }
                //console.log(mySongList);
                //console.log(JSON.stringify(mySongList));
                return mySongList;
            }

            if (error) {
            alert('There was an error during the authentication');
            }
            else {
                if (access_token) {
                //    var maListe = searchSong(SearchField.ALBUM, "akon");
                //    console.log("MA LISTE : ");
                //    console.log(maListe);
                //    console.log("APRES MA LISTE!");
                    //Playlist
                    ///*
                    $.ajax({
                    //url: 'https://api.spotify.com/v1/search?q=beatle&type=track',
                    url: 'https://api.spotify.com/v1/search?q=jackson&type=playlist&limit=15',
                        headers: {
                    'Authorization': 'Bearer ' + access_token
                        },
                        success: function (response) {
                            //console.log(response);
                            var songDiv = document.getElementById("song-list");
                            for (var i = 0; i < response.playlists.items.length; i++) {
                                var newLink = document.createElement("a");
                                //newLink.href = "https://open.spotify.com/track/" + response.tracks.items[i].id;
                                newLink.href = response.playlists.items[i].external_urls.spotify;
                                newLink.innerHTML = response.playlists.items[i].name;
                                songDiv.appendChild(newLink);
                                var lineJump = document.createElement("br");
                                songDiv.appendChild(lineJump);
                            }
                            $('#login').hide();
                            $('#loggedin').show();
                        }
                    });
                    //*/
                    //Track

                    /*
                    $.ajax({
            url: 'https://api.spotify.com/v1/search?q=beatle&type=track&limit=15',
                        headers: {
            'Authorization': 'Bearer ' + access_token
                        },
                        success: function(response) {
            console.log(response);
        var songDiv = document.getElementById("song-list");
                        for(var i =0; i< response.tracks.items.length ; i++)
                        {
                            var newLink = document.createElement("a");
                            newLink.href = response.tracks.items[i].external_urls.spotify;
                            newLink.innerHTML = response.tracks.items[i].name;
                            songDiv.appendChild(newLink);
                            var lineJump = document.createElement("br");
                            songDiv.appendChild(lineJump);
                        }
                            $('#login').hide();
                            $('#loggedin').show();
                        }
                    });
                    */

                    //Artiste

                    /*
                    $.ajax({
            url: 'https://api.spotify.com/v1/search?q=beatle&type=artist&limit=15',
                        headers: {
            'Authorization': 'Bearer ' + access_token
                        },
                        success: function(response) {
            console.log(response);
        var songDiv = document.getElementById("song-list");
                        for(var i =0; i< response.artists.items.length ; i++)
                        {
                            var newLink = document.createElement("a");
                            newLink.href = response.artists.items[i].external_urls.spotify;
                            newLink.innerHTML = response.artists.items[i].name;
                            songDiv.appendChild(newLink);
                            var lineJump = document.createElement("br");
                            songDiv.appendChild(lineJump);
                        }
                            $('#login').hide();
                            $('#loggedin').show();
                        }
                    });
                    */

                    //Album

                    /*
                    $.ajax({
            url: 'https://api.spotify.com/v1/search?q=beatle&type=album&limit=15',
                        headers: {
            'Authorization': 'Bearer ' + access_token
                        },
                        success: function(response) {
            console.log(response);
        var songDiv = document.getElementById("song-list");
                        for(var i =0; i< response.albums.items.length ; i++)
                        {
                            var newLink = document.createElement("a");
                            newLink.href = response.albums.items[i].external_urls.spotify;
                            newLink.innerHTML = response.albums.items[i].name;
                            songDiv.appendChild(newLink);
                            var lineJump = document.createElement("br");
                            songDiv.appendChild(lineJump);
                        }
                            $('#login').hide();
                            $('#loggedin').show();
                        }
                    });
                    */

                } else {
                        // render initial screen
                        $('#login').show();
                        $('#loggedin').hide();
                }

                document.getElementById('obtain-new-token').addEventListener('click', function () {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done(function (data) {
                access_token = data.access_token;
            });
        }, false);
            }
            
      
});