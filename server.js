var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];

app.use(express.static(__dirname + '/public'));

server.listen(8080, function() {
    console.log('Server is running at http://localhost:8080');
    
});

io.on('connection', function(socket) {
    console.log('a user is connected.');

    //count numbers of users
    socket.on('login', function(nickName) {
        if(users.indexOf(nickName) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickName = nickName;
            users.push(nickName);
            socket.emit('loginSuccess');

            io.sockets.emit('System: ', nickName, users.length, 'login');
        }
    });

    socket.on('disconnect', function() {
        console.log('a user is disconnected.');
        users.splice(socket.userIndex, 1);

        socket.broadcast.emit('System: ', socket.nickName, users.length, 'logout');

    });

    //broadcast messages
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickName, msg, color);
    });
})
