"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "./AuthProvider";

const NotificationsContext = createContext(null);

const toWebSocketUrl = (apiUrl) => {
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  return url.toString();
};

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let socket;
    let closed = false;
    let retryTimer;

    const connect = () => {
      socket = new WebSocket(toWebSocketUrl(getApiUrl()));

      socket.onopen = () => {
        if (!closed) {
          setConnected(true);
        }
      };

      socket.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data);
          setEvents((current) => [payload, ...current].slice(0, 20));
        } catch {
          setEvents((current) =>
            [{ type: "notification", message: message.data }, ...current].slice(0, 20)
          );
        }
      };

      socket.onclose = () => {
        setConnected(false);

        if (!closed) {
          retryTimer = setTimeout(connect, 4000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.close();
      }
    };
  }, [user]);

  const dismiss = (index) => {
    setEvents((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const clear = () => setEvents([]);

  const value = useMemo(
    () => ({ connected, events, dismiss, clear }),
    [connected, events]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }

  return context;
};
