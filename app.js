const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const SocketIOFileUpload = require('socketio-file-upload');
const { Server } = require("socket.io");
const io = new Server(server);

const { v4: uuidv4 } = require('uuid');
const { Socket } = require('net');

app.use(SocketIOFileUpload.router).use(express.static(__dirname));
var userlist = [];
var ext = '';
var ofn ='';
io.on('connection', socket => {
	var uploading = new SocketIOFileUpload();
	uploading.dir = "./uploads";
	uploading.listen(socket);
	socket.on('addme', name => {
		userlist.push(name);
		socket.username = name;
		socket.emit('joined', name);
		io.emit('userlistcahnged', userlist);
	});
	socket.on('send', msg => {
		socket.broadcast.emit('message', { user: socket.username, msg: msg });
	});
	uploading.on('start', event => {
		var old_name = event.file.name
		ofn = old_name;
		var arr = old_name.split('.');
		ext = arr[arr.length - 1]
		var new_name = uuidv4() + '.' + arr[arr.length - 1];
		return event.file.name = new_name;
	});
	uploading.on('saved', event => {
		io.emit('uploaded', { from: socket.username, file: event.file.name, oldname:ofn, extension: ext });
	});
});

server.listen(8014, () => {
	console.log('listening on http://localhost:8014');
});