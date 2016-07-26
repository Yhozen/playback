var ipc = require('electron').ipcRenderer
var titlebar = require('titlebar')()

titlebar.appendTo('#titlebar')

titlebar.on('close', () => ipc.send('close'))

titlebar.on('minimize', () => ipc.send('minimize'))

titlebar.on('maximize',() => ipc.send('maximize'))

titlebar.on('fullscreen', () => ipc.send('maximize'))

//FETCH DATA
const REQUEST_URL = 'http://192.168.1.33:5000/movies/1'

fetch(REQUEST_URL)
  .then((response) => response.json())
  .then((responseData) => responseData.filter(isEnglish))
  .then((filtered) => filtered.map(startTorrent))
  .catch((err) => console.error("THERE WAS AN ERROR: " + err))

//FUNCTIONS
var isEnglish = (movie) => movie.torrents.en

var startTorrent = (movie) => {
  var movieDiv = document.createElement('div')
  var movieImg = document.createElement("img")
  movieImg.setAttribute('src', movie.images.poster)
  movieImg.setAttribute('class', 'responsive')
  movieDiv.appendChild(movieImg)
  movieDiv.setAttribute('class', 'movie-flex')
  movieDiv.addEventListener("click", () => ipc.send('player', movie.torrents.en['720p'].url))
  document.getElementById("container").appendChild(movieDiv)
}

//SHOW APP
ipc.send('readyMain')
