var ipc = require('electron').ipcRenderer
var titlebar = require('titlebar')()

titlebar.appendTo('#titlebar')

titlebar.on('close', function () {
  ipc.send('close')
})

titlebar.on('minimize', function () {
  ipc.send('minimize')
})

titlebar.on('maximize', function () {
  ipc.send('maximize')
})

titlebar.on('fullscreen', function () {
  ipc.send('maximize')
})

//FETCH DATA
const REQUEST_URL = 'http://192.168.1.33:5000/movies/1'

fetch(REQUEST_URL)
  .then((response) => response.json())
  .then((responseData) => {
    var filtered = responseData.filter(isEnglish)
    return filtered
  })
  .then((filtered) => filtered.map(startTorrent))
  .catch((err) => console.error("THERE WAS AN ERROR:" + err))

//FUNCTIONS
function isEnglish (movie) {
  return (movie.torrents.en)
}

function startTorrent (movie) {
  var oImg=document.createElement("img")
  oImg.setAttribute('src', movie.images.banner)
  document.getElementById("container").appendChild(oImg)
  oImg.addEventListener("click", function () {
    var magnetURI = movie.torrents.en['720p'].url
    ipc.send('player', magnetURI.toString())
    alert(magnetURI)
  })
}

//SHOW APP
ipc.send('ready')
