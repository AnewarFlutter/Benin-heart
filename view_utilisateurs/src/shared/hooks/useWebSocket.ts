/**
 * Hook WebSocket générique — reconnexion automatique, envoi typé.
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/auth_store';

interface UseWebSocketOptions {
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    enabled?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
    const { onMessage, onConnect, onDisconnect, enabled = true } = options;
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);
    const token = useAuthStore((s) => s.accessToken);

    const connect = useCallback(() => {
        if (!enabled || !token) return;

        // Ajouter le token en query param (le consumer Django le lira via JWTAuthMiddlewareStack)
        const wsUrl = `${url}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            onConnect?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage?.(data);
            } catch {
                onMessage?.(event.data);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            onDisconnect?.();
            // Reconnexion automatique après 3s
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [url, token, enabled, onMessage, onConnect, onDisconnect]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    const send = useCallback((data: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    return { isConnected, send };
}
