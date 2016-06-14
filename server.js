var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use('/', express.static(__dirname + '/public'))

var usersState = {}

io.on('connection', socket => {
  socket.on('disconnect', () => {
    delete usersState[socket.id]
  })

  socket.on('update', state => {
    usersState[socket.id] = state
    socket.emit('update users state', {usersState})
  })
})

http.listen(3000, () => { console.log('Server listening on port ' + 3000) })
