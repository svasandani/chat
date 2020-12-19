const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 4001;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// tech namespace
let endpoints = ['a', 'b', 'c'];

endpoints.forEach(e => {
    app.get('/' + e, (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
})

let namespaces = ['general'].map(e => io.of('/' + e));

namespaces.forEach((ns) => {
    ns.on('connection', (socket) => {
        let room;

        socket.on('join', (data) => {
            room = data.room;
            socket.join(data.room);
            ns.in(data.room).emit('message', { value: `New user just joined the ${data.room} room!` });
        });

        socket.on('message', (data) => {
            ns.in(data.room).emit('message', data);
        });
    
        socket.on('disconnect', () => {
            ns.in(room).emit('message', { value: 'User disconnected' });
        });
    });
});