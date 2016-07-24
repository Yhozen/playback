var electron = require('electron')
var app = electron.app
var BrowserWindow = electron.BrowserWindow
var ipc = electron.ipcMain
var dialog = electron.dialog
var powerSaveBlocker = electron.powerSaveBlocker
var globalShortcut = electron.globalShortcut
var path = require('path')
var shell = require('shell')


var win
var link
var ready = false

// TODO: Implement this code later (macOS only)
// var onopen = function (e, lnk) {
//   e.preventDefault()
//
//   if (ready) {
//     win.send('add-to-playlist', [].concat(lnk))
//     return
//   }
//
//   link = lnk
// }
// app.on('open-file', onopen)
// app.on('open-url', onopen)

console.log(process.version)

var frame = (process.platform === 'win32')

app.on('ready', function () {
  main = new BrowserWindow({
    title: 'Stream Movies',
    width: 860,
    height: 470,
    frame: frame,
    show: false,
    transparent: true,
    backgroundColor: '#000000'
  })

  ipc.on('player', function (event, arg) {
    win = new BrowserWindow({
      title: 'playback',
      width: 860,
      height: 470,
      frame: frame,
      show: false,
      transparent: true,
      backgroundColor: '#000000',
      parent: main,
      })
    win.loadURL( 'file://' + path.join( __dirname, 'player.html#' + '["' + arg + '"]' ) )
    win.openDevTools()

  })
  main.loadURL( 'file://' + path.join( __dirname, 'main.html' ) )
  // win.loadURL( 'file://' + path.join( __dirname, 'player.html#' + '["magnet:?xt=urn:btih:0BBCA7584749D4E741747E32E6EB588AEA03E40F&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337"]'  ) ) //JSON.stringify(process.argv.slice(2))
  main.openDevTools()


  ipc.on('close', function () {
    app.quit()
  })

  ipc.on('closePlayer', function () {
    win.close()
    })


  ipc.on('open-file-dialog', function () {
    var files = dialog.showOpenDialog({ properties: [ 'openFile', 'multiSelections' ] })
    if (files) {
      files.forEach(app.addRecentDocument)
      win.send('add-to-playlist', files)
    }
  })

  ipc.on('open-url-in-external', function (event, url) {
    shell.openExternal(url)
  })

  ipc.on('focus', function () {
    win.focus()
  })

  ipc.on('minimize', function () {
    win.minimize()
  })

  ipc.on('maximize', function () {
    win.maximize()
  })

  ipc.on('resize', function (e, message) {
    if (win.isMaximized()) return
    var wid = win.getSize()[0]
    var hei = (wid / message.ratio) | 0
    win.setSize(wid, hei)
  })

  ipc.on('enter-full-screen', function () {
    win.setFullScreen(true)
  })

  ipc.on('exit-full-screen', function () {
    win.setFullScreen(false)
    win.show()
  })

  ipc.on('ready', function () {
    ready = true
    if (link) win.send('add-to-playlist', [].concat(link))
    win.show()
  })

  ipc.on('readyMain', function () {
    main.show()
  })

  ipc.on('prevent-sleep', function () {
    app.sleepId = powerSaveBlocker.start('prevent-display-sleep')
  })

  ipc.on('allow-sleep', function () {
    powerSaveBlocker.stop(app.sleepId)
  })

  globalShortcut.register('MediaPlayPause', function () {
    win.send('media-play-pause')
  })

  globalShortcut.register('MediaNextTrack', function () {
    win.send('media-next-track')
  })

  globalShortcut.register('MediaPreviousTrack', function () {
    win.send('media-previous-track')
  })
})

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})
