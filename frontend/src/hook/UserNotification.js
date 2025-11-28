import { useEffect, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

const userNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        connectWebSocket((message) => {
            setNotifications(prev => [message, ...prev]);
        });

        return () => disconnectWebSocket();
    }, []);

    return notifications;
};

export default userNotifications;