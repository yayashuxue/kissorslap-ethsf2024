const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Create the HTTP server and attach Socket.IO to it
app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join Room
    socket.on("joinRoom", (user) => {
      socket.join(user.room);
      io.to(user.room).emit("message", {
        username: "Admin",
        text: `${user.username} has joined the room!`,
      });
    });

    // Listen for chat messages
    socket.on("chatMessage", (message) => {
      io.to(message.room).emit("message", {
        username: message.username,
        text: message.text,
      });
    });

    // Handle client disconnects
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
