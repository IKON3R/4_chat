const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const app = express();
var server = https.createServer(app);
const io = require('socket.io')(server);

var clientes = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 3000;
server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en ${PORT}`);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/chat/:username', function (req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

app.post('/login', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  clientes.push({id: id, username: username});
  io.emit('socket_conectado', {id: id, username: username});
  return res.json(clientes);
});

app.post('/send', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  let msg = req.body.text;
  io.emit('mensaje', {id: id, msg: msg, username: username});
  return res.json({text: 'Mensaje enviado.'});
});

io.on('connection', async (socket) => {
  console.log('Socket conectado', socket.id);
  socket.on('disconnect', () => {
    clientes = clientes.filter(cliente => cliente.id != socket.id);
    io.emit('socket_desconectado', {texto: 'Socket desconectado.', id: socket.id});
  });
  await longRunningOperation();
});
