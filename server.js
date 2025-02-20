const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Default route: Serve `index.html`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Bus data with driver details
let buses = [
    { 
        id: 1, 
        route: "Vadodara Airport to ITM (SLS) Baroda University", 
        time: "9:00 AM", 
        status: "On Time", 
        capacity: "40/45", 
        driver: "Amit Shah", 
        contact: "+91 98765 43210", 
        lat: 22.3365, 
        lng: 73.2263 
    },
    { 
        id: 2, 
        route: "Fatehgunj to ITM (SLS) Baroda University", 
        time: "9:00 AM", 
        status: "Delayed", 
        capacity: "30/45", 
        driver: "Narendra Modi", 
        contact: "+91 87654 32109", 
        lat: 22.3082, 
        lng: 73.1815 
    },
    { 
        id: 3, 
        route: "Alkapuri to ITM (SLS) Baroda University", 
        time: "9:15 AM", 
        status: "On Time", 
        capacity: "35/45", 
        driver: "Vijay Rupani", 
        contact: "+91 76543 21098", 
        lat: 22.3153, 
        lng: 73.1883 
    },
    { 
        id: 4, 
        route: "Manjalpur to ITM (SLS) Baroda University", 
        time: "8:50 AM", 
        status: "On Time", 
        capacity: "38/45", 
        driver: "Mukko", 
        contact: "+91 65432 10987", 
        lat: 22.2704, 
        lng: 73.2065 
    },
    { 
        id: 5, 
        route: "Diwalipura to ITM (SLS) Baroda University", 
        time: "9:20 AM", 
        status: "Delayed", 
        capacity: "28/45", 
        driver: "Donald Trump", 
        contact: "+91 54321 09876", 
        lat: 22.3046, 
        lng: 73.1699 
    },
    { 
        id: 6, 
        route: "Karelibaug to ITM (SLS) Baroda University", 
        time: "8:45 AM", 
        status: "On Time", 
        capacity: "42/45", 
        driver: "Raju", 
        contact: "+91 43210 98765", 
        lat: 22.3206, 
        lng: 73.1842 
    }
];

// ✅ API route for bus schedule
app.get("/api/bus-schedule", (req, res) => {
    res.json({ success: true, schedule: buses });
});

// ✅ WebSocket connection for live tracking
wss.on("connection", (ws) => {
    console.log("Client connected");

    // Send initial bus locations
    ws.send(JSON.stringify({ type: "bus_locations", buses }));

    // Simulate live movement every 5 seconds
    const updateInterval = setInterval(() => {
        buses = buses.map(bus => ({
            ...bus,
            lat: bus.lat + (Math.random() - 0.001) * 0.02, // Simulated small movement
            lng: bus.lng + (Math.random() - 0.001) * 0.02,
        }));

        ws.send(JSON.stringify({ type: "bus_locations", buses }));
    }, 5000);

    ws.on("close", () => {
        console.log("Client disconnected");
        clearInterval(updateInterval); // Stop sending updates when client disconnects
    });
});

// ✅ Start server on port 5000
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
