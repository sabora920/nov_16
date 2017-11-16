'use strict';

const CLIENT_ID = '84fe6b45ab3640fcb0f99f4df4fd8a2e';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;
const getArtist = function (name) {
  return getFromApi('search', {
    q: name,
    type: 'artist',
    limit: 1
  }).then(item => {
    artist = item.artists.items[0];
    // console.log(artist);
    return getFromApi(`artists/${artist.id}/related-artists`);
  }).then(item => { //item represents array of artist objects/related objects
    artist.related = item.artists;
    const promises = [];
    artist.related.forEach(relatedArtist  => {
      const { id } = relatedArtist;
    promises.push(getFromApi(`artists/${id}/top-tracks`, {country: 'US'}));
 
    });
    return Promise.all(promises);   
  }).then((item)=>{
    // const artistsWithTopTracks = [];

    item.forEach((topTracks, index) => {
      artist.related[index].topTracks = item.tracks;
    })
    console.log(artist);
    return artist;
  }).catch(err => {
    console.error('There was an error in your search!');
  });
};








// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
