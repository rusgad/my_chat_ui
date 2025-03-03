import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import {Client, over} from "stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

// Тип для сообщения
interface Message {
    from: string;
    content: string;
}

const Chat: React.FC = () => {
    const api = axios.create({
        baseURL: "http://localhost:8080",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const { chatName } = useParams<{ chatName: string }>(); // Получаем chatName из URL
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [from, setFrom] = useState<string>("");
    const [content, setContent] = useState<string>("");

    // Эндпоинт для подключения к WebSocket
    const SOCKET_URL = "http://localhost:8080/chat-websocket";

    // Очередь и топик
    const QUEUE = "/topic";
    const TOPIC = "/message";

    // Подключение к WebSocket
    useEffect(() => {
        const socket = new SockJS(SOCKET_URL);
        const client = over(socket);

        client.connect({
            "Authorization": localStorage.getItem("token")
        }, () => {
            setConnected(true);
            console.log("Connected to WebSocket");

            // Подписка на топик
            client.subscribe(`${QUEUE}${TOPIC}`, (message) => {
                const newMessage: Message = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        });

        setStompClient(client);

        // Отключение при размонтировании компонента
        return () => {
            if (client) {
                client.disconnect(() => {
                    console.log("Disconnected from WebSocket");
                });
            }
        };
    }, []);

    // Отправка сообщения
    const sendMessage = () => {
        if (from && content) {
            const message: Message = {from, content: content};
            api.post("/message/new", message);
        } else {
            console.error("WebSocket is not connected or missing 'from'/'to' values");
        }
    };

    return (
        <div>
            <h2>{chatName}</h2>
            <div>
                <label>
                    From:
                    <input
                        type="text"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    To:
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </label>
            </div>
            <button onClick={sendMessage} disabled={!connected || !from || !content}>
                Send Message
            </button>
            <h3>Received Messages:</h3>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>From:</strong> {msg.from}, <strong>To:</strong> {msg.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;