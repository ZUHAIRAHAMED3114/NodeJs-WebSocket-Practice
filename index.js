const http = require("http");
const WebSocketServer = require("websocket").server;
const WebSocket = require("websocket").WebSocket;
// Create HTTP Server
const httpServer = http.createServer((req, res) => {
    console.log("Request Processing Server Handler");
    console.log("We Received a Request");
});

// Create WebSocket Server
const webSocket = new WebSocketServer({
    "httpServer": httpServer
});

// Define an array to store all active connections
let connections = [];

// Handle WebSocket Requests
webSocket.on("request", (request) => {
    // Accept the WebSocket connection for this request
    const connection = request.accept(null, request.origin);
    console.log("Connection accepted.");

    // Add the new connection to the connections array
    connections.push(connection);

    // Handle Connection Events
    connection.on("message", (message) => {
        // Handle incoming messages from this connection
        console.log("Received message:", message.utf8Data);

        // Broadcast the message to all connected clients
        connections.forEach((clientConnection) => {
            if (clientConnection !== connection && clientConnection.connected) {
                clientConnection.send(message.utf8Data);
            }
        });
    });

    connection.on("close", () => {
        // Remove the closed connection from the connections array
        connections = connections.filter((c) => c !== connection);
        console.log("Connection closed.");
    });
});

function sendNotification() {
    connections.forEach((client) => {
        // Check if the client is still connected
        //if (client.readyState === WebSocket.OPEN) {
            // Send a notification message with the specified type
            let data=JSON.stringify({ type: 'Notification', message: 'Hello from server!' });
            console.log(data);
            client.send(data);
      //  }
    });
}

// Schedule sending notification message every 30 seconds
setInterval(sendNotification, 30000);

// Start the HTTP server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
