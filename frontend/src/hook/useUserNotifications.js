import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useUserNotifications = (onMessage) => {
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        stompClient.subscribe("/topic/notifications", msg => {
          onMessage(JSON.parse(msg.body));
        });

        stompClient.subscribe("/user/queue/notifications", msg => {
          onMessage(JSON.parse(msg.body));
        });
      }
    });

    stompClient.activate();

    return () => {
      if (stompClient.active) stompClient.deactivate();
    };
  }, [onMessage]);
};

export default useUserNotifications;
