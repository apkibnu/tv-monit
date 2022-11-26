const express = require('express');
const app = express();
const port = 3390;
const http = require('http').Server(app)
// module ejs
app.set('view engine', 'ejs');
// access file static
app.use(express.static('public'));
// socket.io
const io = require("socket.io")(http)
const interval = require('./socket/interval')
//routing
const routes = require('./api/routes')

io.on('connection', (socket) => {
    interval.interval(socket)
    interval.disconnect(socket)
})

app.use(routes)

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    console.log(new Date());
});