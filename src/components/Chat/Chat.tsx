import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Client, over } from "stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import "./Chat.css"; // Импортируем стили

// Тип для сообщения
interface Message {
    from: string | undefined;
    content: string;
    chatName: string;
}

const Chat: React.FC = () => {
    const api = axios.create({
        baseURL: "http://localhost:8080",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const { chatName } = useParams<{ chatName: string }>(); // Получаем chatName из URL
    const [connected, setConnected] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
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

        client.connect({}, async () => {
            setConnected(true);

            const chatHistory = await fetchChatHistory(chatName);
            setMessages(chatHistory);

            // Подписка на топик
            client.subscribe(`${QUEUE}${TOPIC}.${chatName}`, (message) => {
                const newMessage: Message = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        });

        // Отключение при размонтировании компонента
        return () => {
            if (client) {
                client.disconnect(() => {
                    console.log("Disconnected from WebSocket");
                });
            }
        };
    }, []);

    const fetchChatHistory = async (chatName: string | undefined) => {
        try {
            const response = await api.get(`/message/chat-history`, {
                params: { chatName }, // Параметры запроса
            });
            return response.data; // Предполагаем, что сервер возвращает { messages: Message[] }
        } catch (error) {
            console.error("Error fetching chat history:", error);
            return []; // Возвращаем пустой массив в случае ошибки
        }
    };

    // Отправка сообщения
    const sendMessage = () => {
        if (content && chatName) {
            const message: Message = { from: undefined, content, chatName };
            console.log(message);
            api.post("/message/new", message);
            setContent(""); // Очищаем поле ввода после отправки
        } else {
            console.error("WebSocket is not connected or missing 'from'/'to' values");
        }
    };

    return (
        <div className="chat-container">
            <h2>{chatName}</h2>
            <div className="message-input">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Введите сообщение..."
                />
                <button onClick={sendMessage} disabled={!connected || !content}>
                    Отправить
                </button>
            </div>
            <h3>Сообщения:</h3>
            <ul className="messages-list">
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>От:</strong> {msg.from}, <strong>Сообщение:</strong> {msg.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;