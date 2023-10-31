const express = require("express");
const app = express();
const http = require("http");
const { Server } = require('socket.io');
const cors = require('cors');
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:5173", "https://roycechatappio.onrender.com"], // Allow requests from the frontend
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://roycechatappio.onrender.com"], // Set the same origin for Socket.IO
        methods: ["GET", "POST"]
    }
});
let socketID = null;

io.on("connection", (socket) => {
        socketID = socket.id;

        // Function to handle displaying chat messages
        displaymsg(socket);

        

        socket.on("createUser", ({ username, room }) => {
            socket.join(room);
        
            // Get the roomSockets (users in room)
            const roomSockets = Array.from(io.sockets.adapter.rooms.get(room) || new Set());
            // Create the user object including roomSockets
            const user = { 
                username: username, 
                socketID: socket.id,
                room: room,
                roomSockets: roomSockets,
            };
            // Emit an update to all users in the room
            io.to(room).emit("joinLog", user);
        });


        socket.on("exitRoom", ({username, room}) => {
        socket.leave(room);
        const userLeft = username;
        //send useres in room the user who left
        io.to(room).emit("exitLog", userLeft); 
    });

});

// Function to display chat messages
const displaymsg = ( socket ) => {
    socket.on('chatmsg', ({ message, username, room, userID }) => {
        // Get the room(s) the user is in
        const userRooms = Array.from(socket.rooms);
        // Send the message to everyone in the current room (including sender)
        socket.nsp.to(userRooms[1]).emit('chatmsg', { message, username, room, userID });
    });
}

// Start the server on port 3000
server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
