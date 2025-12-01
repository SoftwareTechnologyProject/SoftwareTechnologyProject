import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useUserNotifications = (onMessage) => {
  useEffect(() => {
    console.log("🔹 Initializing STOMP client...");

    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🔹 Creating SockJS connection to /ws");
        return new SockJS("http://localhost:8080/ws");
      },
      reconnectDelay: 5000, // tự reconnect nếu mất kết nối
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        console.log("✅ STOMP connected!", frame);

        // Subscribe global notifications
        stompClient.subscribe("/topic/notifications", (msg) => {
          console.log("📨 Received /topic/notifications:", msg.body);
          safeNotify(msg.body, onMessage);
        });

        // Subscribe user-specific notifications
        stompClient.subscribe("/user/queue/notifications", (msg) => {
          console.log("📨 Received /user/queue/notifications:", msg.body);
          safeNotify(msg.body, onMessage);
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"], frame.body);
      },
      onWebSocketClose: (evt) => {
        console.warn("⚠️ WebSocket closed:", evt);
      },
      onWebSocketError: (evt) => {
        console.error("❌ WebSocket error:", evt);
      }
    });

    stompClient.activate();
    console.log("🔹 STOMP client activated");

    return () => {
      if (stompClient.active) {
        console.log("🔹 Deactivating STOMP client...");
        stompClient.deactivate();
      }
    };
  }, []); // chỉ chạy 1 lần khi mount
};

// Xử lý dữ liệu an toàn từ WebSocket
function safeNotify(body, onMessage) {
  try {
    const data = JSON.parse(body);
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item && typeof item === "object") onMessage(item);
      });
    } else if (data && typeof data === "object") {
      onMessage(data);
    } else {
      console.warn("WS data invalid:", data);
    }
  } catch (err) {
    console.error("❌ Failed to parse WS message:", body, err);
  }
}

export default useUserNotifications;
