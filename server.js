const io = require('socket.io')(85, {
  cors: {
    origin: '*',
  }
});


io.on('connection', (socket) => {
  console.log('a user connected');


socket.on('ipod', (data) => {
    io.sockets.emit('move', data);
});
socket.on('start', ()=>{
    io.sockets.emit('start');
});

});

