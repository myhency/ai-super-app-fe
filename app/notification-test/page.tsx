"use client";

import React, { useState, useEffect, useRef } from "react";

export interface NotificationChangeEvent {
    eventType: "CREATED" | "UPDATED";
    ulid: string;
    title?: string;
    content?: string;
}

export interface NotificationEvent {
    type: "CREATED" | "UPDATED" | "connection";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: NotificationChangeEvent | any;
    time: Date;
}

export default function NotificationTest() {
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [connected, setConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] =
        useState<string>("Disconnected");
    const eventSourceRef = useRef<EventSource | null>(null);

    // EventSource 연결 초기화 함수
    const initEventSource = () => {
        // 기존 연결 정리
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            console.log("Initializing EventSource connection...");

            // 캐시 방지를 위한 타임스탬프 추가
            const timestamp = new Date().getTime();
            const eventSource = new EventSource(
                `http://localhost:8080/v1/notification/subscribe?_=${timestamp}`
            );
            eventSourceRef.current = eventSource;

            // 연결 상태 처리
            eventSource.onopen = () => {
                console.log("SSE connection opened");
                setConnected(true);
                setConnectionStatus("Connected");
            };

            // 연결 확인 이벤트 처리
            eventSource.addEventListener(
                "connection",
                (event: MessageEvent) => {
                    console.log("Connection event received:", event.data);
                    try {
                        const data = JSON.parse(event.data);
                        setConnectionStatus(
                            `Connected (${new Date(
                                data.timestamp
                            ).toLocaleTimeString()})`
                        );
                    } catch (error) {
                        console.error("Error parsing connection event:", error);
                    }
                }
            );

            // CREATED 이벤트 처리
            eventSource.addEventListener("CREATED", (event: MessageEvent) => {
                console.log("CREATED event received:", event.data);
                try {
                    const rawData = JSON.parse(event.data);
                    console.log("Parsed CREATED data:", rawData);

                    const normalizedData: NotificationChangeEvent = {
                        eventType: "CREATED",
                        ulid: rawData.ulid || "",
                        title: rawData.title || "",
                        content: rawData.content || "",
                    };

                    setEvents((prev) => {
                        const newEvent = {
                            type: "CREATED" as const,
                            data: normalizedData,
                            time: new Date(),
                        };
                        console.log("Adding CREATED event to state:", newEvent);
                        return [...prev, newEvent];
                    });
                } catch (error) {
                    console.error(
                        "Error parsing CREATED event:",
                        error,
                        "Raw data:",
                        event.data
                    );
                }
            });

            // UPDATED 이벤트 처리
            eventSource.addEventListener("UPDATED", (event: MessageEvent) => {
                console.log("UPDATED event received:", event.data);
                try {
                    const rawData = JSON.parse(event.data);

                    const normalizedData: NotificationChangeEvent = {
                        eventType: "UPDATED",
                        ulid: rawData.ulid || "",
                        title: rawData.title || "",
                        content: rawData.content || "",
                    };

                    setEvents((prev) => {
                        const newEvent = {
                            type: "UPDATED" as const,
                            data: normalizedData,
                            time: new Date(),
                        };
                        console.log("Adding UPDATED event to state:", newEvent);
                        return [...prev, newEvent];
                    });
                } catch (error) {
                    console.error("Error parsing UPDATED event:", error);
                }
            });

            // 일반 message 이벤트 처리 (fallback)
            eventSource.onmessage = (event) => {
                console.log("Generic message event received:", event.data);
                // 특정 이벤트 타입으로 처리되지 않은 메시지들을 여기서 처리
                if (event.data && !event.data.includes("heartbeat")) {
                    console.log("Processing generic message:", event.data);
                }
            };

            // 에러 처리
            eventSource.onerror = (error) => {
                console.error("SSE connection error:", error);
                setConnected(false);
                setConnectionStatus("Connection Error");

                // 연결이 끊어지면 5초 후 재연결 시도
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log(
                        "Connection closed, attempting to reconnect in 5 seconds..."
                    );
                    setTimeout(() => {
                        console.log("Attempting to reconnect...");
                        initEventSource();
                    }, 5000);
                }
            };
        } catch (connectionError) {
            console.error("Failed to create EventSource:", connectionError);
            setConnected(false);
            setConnectionStatus("Connection Failed");
        }
    };

    // 컴포넌트 마운트 시 EventSource 초기화
    useEffect(() => {
        console.log("Component mounted, initializing EventSource");
        initEventSource();

        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log("Component unmounting, cleaning up EventSource");
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    const testCreate = async () => {
        console.log("Creating test notification...");
        try {
            const response = await fetch(
                "http://localhost:8080/v1/notification/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: "Test Notification",
                        content:
                            "This is a test at " +
                            new Date().toLocaleTimeString(),
                        locale: "ko",
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            console.log("Create notification response:", result);
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
    };

    // 연결 새로고침
    const refreshConnection = () => {
        console.log("Refreshing connection...");
        initEventSource();
    };

    // 이벤트 초기화
    const clearEvents = () => {
        console.log("Clearing events...");
        setEvents([]);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderEventData = (data: NotificationChangeEvent | any) => {
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
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Notification Test</h2>
            <div className="mb-4 p-4 bg-gray-100 rounded">
                <p className="mb-2">
                    <strong>Connection Status:</strong>{" "}
                    {connected ? "✅" : "❌"} {connectionStatus}
                </p>
                <p className="text-sm text-gray-600">
                    Check browser console for detailed logs
                </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={testCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={!connected}
                >
                    Create Test Notification
                </button>
                <button
                    onClick={refreshConnection}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Refresh Connection
                </button>
                <button
                    onClick={clearEvents}
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

            <h3 className="text-xl font-semibold mb-2">
                Events: {events.length}
            </h3>
            <div className="max-h-96 overflow-auto border rounded p-2">
                {events.length === 0 ? (
                    <p className="text-gray-500">No events yet...</p>
                ) : (
                    events
                        .slice()
                        .reverse() // 최신 이벤트를 맨 위에 표시
                        .map((event, index) => (
                            <div
                                key={index}
                                className={`mb-2 p-3 border rounded ${
                                    event.type === "CREATED"
                                        ? "bg-green-50 border-green-200"
                                        : event.type === "UPDATED"
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-gray-50"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <strong
                                        className={`${
                                            event.type === "CREATED"
                                                ? "text-green-600"
                                                : event.type === "UPDATED"
                                                ? "text-blue-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {event.type}
                                    </strong>
                                    <span className="text-sm text-gray-500">
                                        {event.time.toLocaleTimeString()}
                                    </span>
                                </div>
                                {renderEventData(event.data)}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
