import { WebSocketServer } from 'ws';

let wss = null;

export const initializeWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received:', data);
            } catch (error) {
                console.error('Invalid message format:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};

export const broadcast = (data) => {
    if (!wss) {
        console.error('WebSocket server not initialized');
        return;
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

export default {
    initializeWebSocket,
    broadcast
}; 