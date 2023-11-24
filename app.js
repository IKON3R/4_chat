const express = require('express');
const bodyParser = require('body-parser');
var app = require('express')();
var server = require('https').Server(app);
import { Server } from "socket.io";

const io = new Server({
  path: "/logica.js"
});

io.listen(3000);

var clientes = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PORT = 'https://segundoint.onrender.com';
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
