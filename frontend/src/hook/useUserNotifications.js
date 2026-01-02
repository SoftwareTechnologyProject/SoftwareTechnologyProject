import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useUserNotifications = (onNotification, onChatMessage) => {
  const clientRef = useRef(null);
  const callbacksRef = useRef({ onNotification, onChatMessage });
  const isConnectedRef = useRef(false);

  // Luôn update callbacks mới nhất
  useEffect(() => {
    callbacksRef.current = { onNotification, onChatMessage };
  }, [onNotification, onChatMessage]);

  useEffect(() => {
    if (clientRef.current) {
      console.log("⚠ WS already initialized → skip reinit");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ No accessToken found - cannot connect WebSocket");
      return;
    }
    
    console.log("🔵 Initializing WebSocket connection...");
    console.log("🔑 Token length:", token.length);
    
    let connectionTimeout;
    
    const stompClient = new Client({
      // Backend WS endpoint runs on port 8081 per RUN_PROJECT.md
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: { Authorization: "Bearer " + token },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      
      onConnect: (frame) => {
        clearTimeout(connectionTimeout);
        console.log("✅ STOMP connected");
        console.log("Connected user:", frame.headers["user-name"] || "unknown");
        isConnectedRef.current = true;

        // Subscribe với callback động
        stompClient.subscribe("/user/queue/chat", (msg) => {
        console.log("subscribe thành công");
          console.log(`📩 Chat from /user/queue/chat:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onChatMessage);
        });

        stompClient.subscribe("/topic/chat", (msg) => {
          console.log(`📩 Chat from /topic/chat:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onChatMessage);
        });

        // Notification subscriptions...
        stompClient.subscribe("/user/queue/notifications", (msg) => {
          console.log(`📩 Notif from /user/queue/notifications:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onNotification);
        });
      },
      onStompError: (frame) => {
        clearTimeout(connectionTimeout);
        console.error("❌ STOMP Error:", frame.headers["message"]);
        console.error("Full error frame:", frame);
        isConnectedRef.current = false;
      },
      onWebSocketClose: (event) => {
        console.warn("⚠ WS closed", event);
        isConnectedRef.current = false;
      },
      onWebSocketError: (err) => {
        clearTimeout(connectionTimeout);
        console.error("❌ WS Error:", err);
        console.error("❌ Backend might be down or wrong port?");
        isConnectedRef.current = false;
      },
    });

    clientRef.current = stompClient;
    
    // Set connection timeout (10 seconds)
    connectionTimeout = setTimeout(() => {
      if (!isConnectedRef.current) {
        console.error("❌ WebSocket connection timeout after 10 seconds!");
        console.error("🔍 Debug: Token exists?", !!token);
        console.error("🔍 Debug: Backend running? Check: docker ps | grep bookstore");
        console.error("🔍 Debug: Try logout and login again");
      }
    }, 10000);
    
    stompClient.activate();
    console.log("🚀 WebSocket Activated");

    return () => {
      console.log("🔹 WS cleanup - deactivating...");
      clearTimeout(connectionTimeout);
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      clientRef.current = null; // Reset ref to allow re-init
    };
  }, []); // Chỉ chạy 1 lần

  const sendChatMessage = (chatBody) => {
    if (!clientRef.current?.active || !isConnectedRef.current) {
      console.warn("⛔ WS not ready. Active:", clientRef.current?.active, "Connected:", isConnectedRef.current);
      alert("Đang kết nối tới server, vui lòng thử lại sau 2 giây...");
      return;
    }
    
    try {
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatBody),
      });
      console.log("📤 Sent:", chatBody);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  return { sendChatMessage, isConnected: isConnectedRef };
};

function safeNotify(body, callback) {
  if (!callback) return;
  try {
    console.log("Raw body:", body);
    callback(JSON.parse(body));
  } catch (e) {
    console.error("❌ Parse error:", body, e);
  }
}

export default useUserNotifications;
