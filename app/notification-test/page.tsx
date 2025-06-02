"use client";

import React, { useState, useEffect, useRef } from "react";

export interface NotificationChangeEvent {
    eventType: "CREATED" | "UPDATED";
    ulid: string;
    title: string;
    content: string;
}

export interface NotificationEvent {
    type: "CREATED" | "UPDATED";
    data: NotificationChangeEvent;
    time: Date;
}

interface EventLog {
    type: "INFO" | "ERROR" | "EVENT" | "DEBUG";
    message: string;
    data?: any;
    timestamp: Date;
}

export default function NotificationTest() {
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [connected, setConnected] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
    const [showLogs, setShowLogs] = useState(true); // 기본값을 true로 변경
    const logsEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // 로그 스크롤을 맨 아래로 이동
    useEffect(() => {
        if (logsEndRef.current && showLogs) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [eventLogs, showLogs]);

    // 로그 추가 함수
    const addLog = (
        type: "INFO" | "ERROR" | "EVENT" | "DEBUG",
        message: string,
        data?: any
    ) => {
        console.log(`[${type}] ${message}`, data || "");
        setEventLogs((prev) => [
            ...prev,
            {
                type,
                message,
                timestamp: new Date(),
                data,
            },
        ]);
    };

    // EventSource 연결 초기화 함수
    const initEventSource = () => {
        // 기존 연결 정리
        if (eventSourceRef.current) {
            addLog("INFO", "Closing existing EventSource connection");
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            addLog("INFO", "Creating new EventSource connection...");

            // 캐시 방지를 위한 타임스탬프 추가
            const timestamp = new Date().getTime();
            const eventSource = new EventSource(
                `http://localhost:8080/v1/notification/subscribe?_=${timestamp}`
            );
            eventSourceRef.current = eventSource;

            // 연결 상태 처리
            eventSource.onopen = () => {
                addLog("INFO", "SSE Connected successfully");
                setConnected(true);
                setLastError(null);

                // 연결 성공 시 테스트 이벤트 요청 (디버깅용)
                // 실제 환경에서는 필요에 따라 주석 처리
                // setTimeout(() => {
                //     addLog("DEBUG", "Automatically requesting test event after connection");
                //     emitTestEvent();
                // }, 2000);
            };

            // 일반 message 이벤트 처리 (이벤트 타입이 지정되지 않은 경우)
            eventSource.onmessage = (event) => {
                addLog("EVENT", "Received generic message", {
                    data: event.data,
                    lastEventId: event.lastEventId,
                    origin: event.origin,
                    type: event.type,
                });

                try {
                    // 일반 메시지로 들어오는 데이터도 처리 시도
                    if (event.data) {
                        const rawData = JSON.parse(event.data);
                        addLog("DEBUG", "Parsed generic data", rawData);

                        // 데이터에 eventType이 있으면 이벤트로 처리
                        if (rawData.eventType) {
                            const normalizedData: NotificationChangeEvent = {
                                eventType: rawData.eventType,
                                ulid:
                                    typeof rawData.ulid === "object"
                                        ? JSON.stringify(rawData.ulid)
                                        : rawData.ulid || "",
                                title: rawData.title || "",
                                content: rawData.content || "",
                            };

                            addLog(
                                "INFO",
                                `Normalized ${rawData.eventType} data from generic message`,
                                normalizedData
                            );
                            setEvents((prev) => [
                                ...prev,
                                {
                                    type: rawData.eventType as
                                        | "CREATED"
                                        | "UPDATED",
                                    data: normalizedData,
                                    time: new Date(),
                                },
                            ]);
                        }
                    }
                } catch (error) {
                    addLog(
                        "DEBUG",
                        "Not JSON data in generic message or other error",
                        { error, data: event.data }
                    );
                }
            };

            // CREATED 이벤트 처리
            eventSource.addEventListener("CREATED", (event: MessageEvent) => {
                addLog("EVENT", "Raw CREATED event received", {
                    data: event.data,
                    lastEventId: event.lastEventId,
                    origin: event.origin,
                    type: event.type,
                });
                try {
                    const rawData = JSON.parse(event.data);
                    addLog("INFO", "Parsed CREATED data", rawData);

                    // 데이터 정규화 - Java 객체가 포함된 경우 처리
                    const normalizedData: NotificationChangeEvent = {
                        eventType: "CREATED",
                        ulid:
                            typeof rawData.ulid === "object"
                                ? JSON.stringify(rawData.ulid)
                                : rawData.ulid || "",
                        title: rawData.title || "",
                        content: rawData.content || "",
                    };

                    addLog("INFO", "Normalized CREATED data", normalizedData);
                    setEvents((prev) => [
                        ...prev,
                        {
                            type: "CREATED",
                            data: normalizedData,
                            time: new Date(),
                        },
                    ]);
                } catch (error) {
                    addLog("ERROR", `Error parsing CREATED event: ${error}`, {
                        error,
                        data: event.data,
                    });
                    setLastError(`Error parsing CREATED event: ${error}`);
                }
            });

            // UPDATED 이벤트 처리
            eventSource.addEventListener("UPDATED", (event: MessageEvent) => {
                addLog("EVENT", "Raw UPDATED event received", {
                    data: event.data,
                    lastEventId: event.lastEventId,
                    origin: event.origin,
                    type: event.type,
                });
                try {
                    const rawData = JSON.parse(event.data);
                    addLog("INFO", "Parsed UPDATED data", rawData);

                    // 데이터 정규화 - Java 객체가 포함된 경우 처리
                    const normalizedData: NotificationChangeEvent = {
                        eventType: "UPDATED",
                        ulid:
                            typeof rawData.ulid === "object"
                                ? JSON.stringify(rawData.ulid)
                                : rawData.ulid || "",
                        title: rawData.title || "",
                        content: rawData.content || "",
                    };

                    addLog("INFO", "Normalized UPDATED data", normalizedData);
                    setEvents((prev) => [
                        ...prev,
                        {
                            type: "UPDATED",
                            data: normalizedData,
                            time: new Date(),
                        },
                    ]);
                } catch (error) {
                    addLog("ERROR", `Error parsing UPDATED event: ${error}`, {
                        error,
                        data: event.data,
                    });
                    setLastError(`Error parsing UPDATED event: ${error}`);
                }
            });

            // 백엔드가 보낼 수 있는 다른 이벤트 타입도 처리
            ["MESSAGE", "NOTIFICATION", "UPDATE", "CREATE"].forEach(
                (eventType) => {
                    eventSource.addEventListener(
                        eventType,
                        (event: MessageEvent) => {
                            addLog("EVENT", `Raw ${eventType} event received`, {
                                data: event.data,
                                lastEventId: event.lastEventId,
                                origin: event.origin,
                                type: event.type,
                            });
                            try {
                                const rawData = JSON.parse(event.data);
                                addLog(
                                    "INFO",
                                    `Parsed ${eventType} data`,
                                    rawData
                                );

                                // 알림 이벤트로 간주하고 처리
                                const normalizedData: NotificationChangeEvent =
                                    {
                                        eventType: "CREATED", // 기본값으로 CREATED 사용
                                        ulid:
                                            typeof rawData.ulid === "object"
                                                ? JSON.stringify(rawData.ulid)
                                                : rawData.ulid || "",
                                        title: rawData.title || "",
                                        content: rawData.content || "",
                                    };

                                addLog(
                                    "INFO",
                                    `Normalized ${eventType} data`,
                                    normalizedData
                                );
                                setEvents((prev) => [
                                    ...prev,
                                    {
                                        type: "CREATED", // 기본값으로 CREATED 사용
                                        data: normalizedData,
                                        time: new Date(),
                                    },
                                ]);
                            } catch (error) {
                                addLog(
                                    "ERROR",
                                    `Error parsing ${eventType} event: ${error}`,
                                    { error, data: event.data }
                                );
                            }
                        }
                    );
                }
            );

            // 에러 처리 개선
            eventSource.onerror = (error) => {
                addLog("ERROR", "SSE Error occurred", error);
                setConnected(false);
                setLastError(`SSE connection error. Try refreshing the page.`);

                // 연결이 끊어지면 다시 연결 시도
                if (
                    eventSource &&
                    eventSource.readyState === EventSource.CLOSED
                ) {
                    addLog(
                        "INFO",
                        "Connection closed, will attempt to reconnect..."
                    );
                    // 자동 재연결 로직 (옵션)
                    // setTimeout(initEventSource, 5000);
                }
            };
        } catch (connectionError) {
            addLog(
                "ERROR",
                `Failed to create EventSource: ${connectionError}`,
                connectionError
            );
            setLastError(`Failed to create EventSource: ${connectionError}`);
            setConnected(false);
        }
    };

    // 컴포넌트 마운트 시 EventSource 초기화
    useEffect(() => {
        initEventSource();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (eventSourceRef.current) {
                addLog("INFO", "Closing EventSource connection on unmount");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    const testCreate = async () => {
        try {
            addLog("INFO", "Sending create notification request");
            const response = await fetch(
                "http://localhost:8080/v1/notification/create",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
            addLog("INFO", "Create notification successful", { result });
        } catch (error) {
            addLog("ERROR", `Failed to create notification: ${error}`, error);
            setLastError(`Failed to create notification: ${error}`);
        }
    };

    // 테스트 이벤트 발행 함수
    const emitTestEvent = async () => {
        try {
            addLog("INFO", "Requesting test event emission");
            const response = await fetch(
                "http://localhost:8080/v1/notification/test/emit-test-event",
                { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            addLog("INFO", "Test event emission successful", { result });
        } catch (error) {
            addLog("ERROR", `Failed to emit test event: ${error}`, error);
            setLastError(`Failed to emit test event: ${error}`);
        }
    };

    // 연결 새로고침
    const refreshConnection = () => {
        addLog("INFO", "Manually refreshing connection");
        initEventSource();
    };

    const renderEventData = (data: NotificationChangeEvent) => {
        return (
            <div className="bg-white p-2 rounded border">
                <p>
                    <strong>ULID:</strong>{" "}
                    {typeof data.ulid === "object"
                        ? "Complex Object"
                        : data.ulid}
                </p>
                <p>
                    <strong>Title:</strong> {data.title}
                </p>
                <p>
                    <strong>Content:</strong> {data.content}
                </p>
                <details>
                    <summary className="cursor-pointer text-sm text-blue-500">
                        Raw Data
                    </summary>
                    <pre className="text-xs overflow-auto mt-2 p-2 bg-gray-100 rounded">
                        {JSON.stringify(
                            data,
                            (key, value) => {
                                // 객체가 너무 복잡한 경우 간단히 표시
                                if (
                                    typeof value === "object" &&
                                    value !== null &&
                                    !Array.isArray(value)
                                ) {
                                    const keys = Object.keys(value);
                                    if (keys.length > 5) {
                                        return `[Complex Object with keys: ${keys
                                            .slice(0, 5)
                                            .join(", ")}...]`;
                                    }
                                }
                                return value;
                            },
                            2
                        )}
                    </pre>
                </details>
            </div>
        );
    };

    // 로그 타입에 따른 스타일 지정
    const getLogStyle = (type: string) => {
        switch (type) {
            case "ERROR":
                return "text-red-600";
            case "EVENT":
                return "text-purple-600";
            case "DEBUG":
                return "text-gray-600";
            default:
                return "text-blue-600";
        }
    };

    // 모든 이벤트 로그를 JSON으로 내보내기
    const exportLogs = () => {
        const dataStr = JSON.stringify(eventLogs, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);
        const exportFileDefaultName = `notification-events-${new Date().toISOString()}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    // 로그 지우기
    const clearLogs = () => {
        if (confirm("모든 로그를 지우시겠습니까?")) {
            setEventLogs([]);
            addLog("INFO", "All logs cleared");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Notification Test</h2>
            <p className="mb-4">
                Connection: {connected ? "✅ Connected" : "❌ Disconnected"}
            </p>
            {lastError && (
                <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
                    <strong>Error:</strong> {lastError}
                </div>
            )}
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={testCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create Test Notification
                </button>
                <button
                    onClick={emitTestEvent}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Emit Test Event
                </button>
                <button
                    onClick={refreshConnection}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Refresh Connection
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Reload Page
                </button>
                <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    {showLogs ? "Hide Event Logs" : "Show Event Logs"}
                </button>
            </div>

            {/* 연결 상태 정보 */}
            <div className="mb-4 p-3 border rounded bg-gray-50">
                <h3 className="font-semibold mb-2">Connection Information:</h3>
                <p>
                    <strong>Status:</strong>{" "}
                    {connected ? "Connected" : "Disconnected"}
                </p>
                <p>
                    <strong>ReadyState:</strong>{" "}
                    {eventSourceRef.current
                        ? eventSourceRef.current.readyState === 0
                            ? "CONNECTING"
                            : eventSourceRef.current.readyState === 1
                            ? "OPEN"
                            : "CLOSED"
                        : "Not Initialized"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    If events are not being received, try checking browser
                    console for errors or inspect network traffic.
                </p>
            </div>

            {/* 이벤트 로그 섹션 */}
            {showLogs && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">
                            Event Logs ({eventLogs.length})
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={exportLogs}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                disabled={eventLogs.length === 0}
                            >
                                Export Logs
                            </button>
                            <button
                                onClick={clearLogs}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={eventLogs.length === 0}
                            >
                                Clear Logs
                            </button>
                        </div>
                    </div>
                    <div className="max-h-80 overflow-auto border rounded p-2 bg-gray-50">
                        {eventLogs.length === 0 ? (
                            <p className="text-gray-500 p-2">No logs yet...</p>
                        ) : (
                            <div className="space-y-1">
                                {eventLogs.map((log, idx) => (
                                    <div
                                        key={idx}
                                        className="text-sm p-1 border-b"
                                    >
                                        <div className="flex justify-between">
                                            <span
                                                className={getLogStyle(
                                                    log.type
                                                )}
                                            >
                                                [{log.type}]
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {log.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div>{log.message}</div>
                                        {log.data && (
                                            <details className="mt-1">
                                                <summary className="cursor-pointer text-xs text-blue-500">
                                                    Data Details
                                                </summary>
                                                <pre className="text-xs overflow-auto mt-1 p-1 bg-gray-100 rounded">
                                                    {JSON.stringify(
                                                        log.data,
                                                        (key, value) => {
                                                            if (
                                                                key ===
                                                                    "currentTarget" ||
                                                                key === "target"
                                                            ) {
                                                                return "[DOM Element]";
                                                            }
                                                            if (
                                                                typeof value ===
                                                                    "object" &&
                                                                value !==
                                                                    null &&
                                                                !Array.isArray(
                                                                    value
                                                                )
                                                            ) {
                                                                const keys =
                                                                    Object.keys(
                                                                        value
                                                                    );
                                                                if (
                                                                    keys.length >
                                                                    10
                                                                ) {
                                                                    return `[Complex Object with keys: ${keys
                                                                        .slice(
                                                                            0,
                                                                            10
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}...]`;
                                                                }
                                                            }
                                                            return value;
                                                        },
                                                        2
                                                    )}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <h3 className="text-xl font-semibold mb-2">
                Events: {events.length}
            </h3>
            <div className="max-h-96 overflow-auto border rounded p-2">
                {events.length === 0 ? (
                    <p className="text-gray-500">No events yet...</p>
                ) : (
                    events.map((event, index) => (
                        <div
                            key={index}
                            className="mb-2 p-3 border rounded bg-gray-50"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-blue-600">
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
