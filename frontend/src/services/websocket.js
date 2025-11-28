import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: () => {},
        onConnect: () => {
            // Broadcast
            stompClient.subscribe('/topic/notifications', (msg) => {
                onMessageReceived(JSON.parse(msg.body));
            });

            // User-specific notifications
            stompClient.subscribe('/user/queue/notifications', (msg) => {
                onMessageReceived(JSON.parse(msg.body));
            });
        },
        onDisconnect: () => console.log("Disconnected")
    });

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient) stompClient.deactivate();
};
