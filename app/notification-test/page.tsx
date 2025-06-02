"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Types
export interface NotificationChangeEvent {
    eventType: "CREATED" | "UPDATED" | "LATEST";
    ulid: string;
    title?: string;
    content?: string;
}

export interface NotificationEvent {
    type: "CREATED" | "UPDATED" | "LATEST" | "connection";
    data: NotificationChangeEvent;
    time: Date;
}

interface ConnectionStatus {
    connected: boolean;
    status: string;
}

// Constants
const API_CONFIG = {
    BASE_URL: "http://localhost:8080/v1/notification",
    RECONNECT_DELAY: 5000,
} as const;

const EVENT_TYPES = {
    CONNECTION: "connection",
    LATEST_NOTIFICATION: "latest_notification",
    CREATED: "CREATED",
    UPDATED: "UPDATED",
} as const;

// Custom Hook for SSE Connection
function useSSEConnection() {
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false,
        status: "Disconnected",
    });
    const [latestNotification, setLatestNotification] =
        useState<NotificationChangeEvent | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const addEvent = useCallback((event: NotificationEvent) => {
        setEvents((prev) => [...prev, event]);
    }, []);

    const createEventSource = useCallback(() => {
        const timestamp = new Date().getTime();
        return new EventSource(
            `${API_CONFIG.BASE_URL}/subscribe?_=${timestamp}`
        );
    }, []);

    const handleConnectionOpen = useCallback(() => {
        console.log("SSE connection opened");
        setConnectionStatus({ connected: true, status: "Connected" });
    }, []);

    const handleConnectionEvent = useCallback((event: MessageEvent) => {
        console.log("Connection event received:", event.data);
        try {
            const data = JSON.parse(event.data);
            setConnectionStatus({
                connected: true,
                status: `Connected (${new Date(
                    data.timestamp
                ).toLocaleTimeString()})`,
            });
        } catch (error) {
            console.error("Error parsing connection event:", error);
        }
    }, []);

    const normalizeEventData = useCallback(
        (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rawData: any,
            eventType: NotificationChangeEvent["eventType"]
        ): NotificationChangeEvent => {
            return {
                eventType,
                ulid: rawData.ulid || "",
                title: rawData.title || "",
                content: rawData.content || "",
            };
        },
        []
    );

    const handleNotificationEvent = useCallback(
        (
            event: MessageEvent,
            eventType: NotificationChangeEvent["eventType"]
        ) => {
            console.log(`${eventType} event received:`, event.data);
            try {
                const rawData = JSON.parse(event.data);
                const normalizedData = normalizeEventData(rawData, eventType);

                if (eventType === "CREATED" || eventType === "LATEST") {
                    setLatestNotification(normalizedData);
                }

                addEvent({
                    type: eventType,
                    data: normalizedData,
                    time: new Date(),
                });
            } catch (error) {
                console.error(
                    `Error parsing ${eventType} event:`,
                    error,
                    "Raw data:",
                    event.data
                );
            }
        },
        [normalizeEventData, addEvent]
    );

    const handleConnectionError = useCallback((error: Event) => {
        console.error("SSE connection error:", error);
        setConnectionStatus({ connected: false, status: "Connection Error" });

        const eventSource = eventSourceRef.current;
        if (eventSource?.readyState === EventSource.CLOSED) {
            console.log(
                `Connection closed, attempting to reconnect in ${
                    API_CONFIG.RECONNECT_DELAY / 1000
                } seconds...`
            );
            setTimeout(() => {
                console.log("Attempting to reconnect...");
                initConnection();
            }, API_CONFIG.RECONNECT_DELAY);
        }
    }, []);

    const setupEventListeners = useCallback(
        (eventSource: EventSource) => {
            eventSource.onopen = handleConnectionOpen;
            eventSource.onerror = handleConnectionError;

            eventSource.addEventListener(
                EVENT_TYPES.CONNECTION,
                handleConnectionEvent
            );
            eventSource.addEventListener(
                EVENT_TYPES.LATEST_NOTIFICATION,
                (event) => handleNotificationEvent(event, "LATEST")
            );
            eventSource.addEventListener(EVENT_TYPES.CREATED, (event) =>
                handleNotificationEvent(event, "CREATED")
            );
            eventSource.addEventListener(EVENT_TYPES.UPDATED, (event) =>
                handleNotificationEvent(event, "UPDATED")
            );

            eventSource.onmessage = (event) => {
                console.log("Generic message event received:", event.data);
                if (event.data && !event.data.includes("heartbeat")) {
                    console.log("Processing generic message:", event.data);
                }
            };
        },
        [
            handleConnectionOpen,
            handleConnectionError,
            handleConnectionEvent,
            handleNotificationEvent,
        ]
    );

    const initConnection = useCallback(() => {
        // Clean up existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            console.log("Initializing EventSource connection...");
            const eventSource = createEventSource();
            eventSourceRef.current = eventSource;
            setupEventListeners(eventSource);
        } catch (connectionError) {
            console.error("Failed to create EventSource:", connectionError);
            setConnectionStatus({
                connected: false,
                status: "Connection Failed",
            });
        }
    }, [createEventSource, setupEventListeners]);

    const refreshConnection = useCallback(() => {
        console.log("Refreshing connection...");
        setLatestNotification(null);
        initConnection();
    }, [initConnection]);

    const clearEvents = useCallback(() => {
        console.log("Clearing events...");
        setEvents([]);
        setLatestNotification(null);
    }, []);

    useEffect(() => {
        console.log("Component mounted, initializing EventSource");
        initConnection();

        return () => {
            console.log("Component unmounting, cleaning up EventSource");
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [initConnection]);

    return {
        events,
        connectionStatus,
        latestNotification,
        refreshConnection,
        clearEvents,
    };
}

// Custom Hook for Notification API
function useNotificationAPI() {
    const createNotification = useCallback(async () => {
        console.log("Creating test notification...");
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: "Test Notification",
                    content: `This is a test at ${new Date().toLocaleTimeString()}`,
                    locale: "ko",
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            console.log("Create notification response:", result);
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
    }, []);

    return { createNotification };
}

// UI Components
interface ConnectionStatusProps {
    connectionStatus: ConnectionStatus;
}

function ConnectionStatusDisplay({ connectionStatus }: ConnectionStatusProps) {
    return (
        <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="mb-2">
                <strong>Connection Status:</strong>{" "}
                {connectionStatus.connected ? "✅" : "❌"}{" "}
                {connectionStatus.status}
            </p>
            <p className="text-sm text-gray-600">
                Check browser console for detailed logs
            </p>
        </div>
    );
}

interface LatestNotificationProps {
    notification: NotificationChangeEvent;
}

function LatestNotificationCard({ notification }: LatestNotificationProps) {
    return (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                📢 Latest Notification
            </h3>
            <EventDataDisplay data={notification} />
        </div>
    );
}

interface EventDataDisplayProps {
    data: NotificationChangeEvent;
}

function EventDataDisplay({ data }: EventDataDisplayProps) {
    return (
        <div className="bg-white p-2 rounded border">
            <p>
                <strong>Type:</strong> {data.eventType || "N/A"}
            </p>
            <p>
                <strong>ULID:</strong> {data.ulid || "N/A"}
            </p>
            {data.title && (
                <p>
                    <strong>Title:</strong> {data.title}
                </p>
            )}
            {data.content && (
                <p>
                    <strong>Content:</strong> {data.content}
                </p>
            )}
            <details>
                <summary className="cursor-pointer text-sm text-blue-500">
                    Raw Data
                </summary>
                <pre className="text-xs overflow-auto mt-2 p-2 bg-gray-100 rounded">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </details>
        </div>
    );
}

interface ControlButtonsProps {
    connected: boolean;
    onCreateNotification: () => void;
    onRefreshConnection: () => void;
    onClearEvents: () => void;
}

function ControlButtons({
    connected,
    onCreateNotification,
    onRefreshConnection,
    onClearEvents,
}: ControlButtonsProps) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            <button
                onClick={onCreateNotification}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={!connected}
            >
                Create Test Notification
            </button>
            <button
                onClick={onRefreshConnection}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Refresh Connection
            </button>
            <button
                onClick={onClearEvents}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
                Clear Events
            </button>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Reload Page
            </button>
        </div>
    );
}

interface EventListProps {
    events: NotificationEvent[];
}

function EventList({ events }: EventListProps) {
    const getEventStyles = (eventType: string) => {
        const styles = {
            CREATED: "bg-green-50 border-green-200 text-green-600",
            UPDATED: "bg-blue-50 border-blue-200 text-blue-600",
            LATEST: "bg-orange-50 border-orange-200 text-orange-600",
            default: "bg-gray-50 text-gray-600",
        };
        return styles[eventType as keyof typeof styles] || styles.default;
    };

    if (events.length === 0) {
        return (
            <div className="max-h-96 overflow-auto border rounded p-2">
                <p className="text-gray-500">No events yet...</p>
            </div>
        );
    }

    return (
        <div className="max-h-96 overflow-auto border rounded p-2">
            {events
                .slice()
                .reverse() // 최신 이벤트를 맨 위에 표시
                .map((event, index) => {
                    const eventStyles = getEventStyles(event.type);
                    const [bgColor, borderColor, textColor] =
                        eventStyles.split(" ");

                    return (
                        <div
                            key={index}
                            className={`mb-2 p-3 border rounded ${bgColor} ${borderColor}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <strong className={textColor}>
                                    {event.type}
                                    {event.type === "LATEST" &&
                                        " (Initial Load)"}
                                </strong>
                                <span className="text-sm text-gray-500">
                                    {event.time.toLocaleTimeString()}
                                </span>
                            </div>
                            <EventDataDisplay data={event.data} />
                        </div>
                    );
                })}
        </div>
    );
}

// Main Component
export default function NotificationTest() {
    const {
        events,
        connectionStatus,
        latestNotification,
        refreshConnection,
        clearEvents,
    } = useSSEConnection();

    const { createNotification } = useNotificationAPI();

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Notification Test</h2>

            <ConnectionStatusDisplay connectionStatus={connectionStatus} />

            {latestNotification && (
                <LatestNotificationCard notification={latestNotification} />
            )}

            <ControlButtons
                connected={connectionStatus.connected}
                onCreateNotification={createNotification}
                onRefreshConnection={refreshConnection}
                onClearEvents={clearEvents}
            />

            <h3 className="text-xl font-semibold mb-2">
                Events: {events.length}
            </h3>

            <EventList events={events} />
        </div>
    );
}
