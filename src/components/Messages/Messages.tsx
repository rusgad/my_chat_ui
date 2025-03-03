import React, { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';



// Тип для сообщения
interface Message {
    from: string;
    to: string;
}

const Messages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    // Префикс, очередь и топик
    // const PREFIX = "/app";
    const QUEUE = "/topic";
    const TOPIC = "/messages";
    const token = localStorage.getItem("token");

    // Подключение к WebSocket
    useEffect(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/chat-websocket', // Указываем хост и путь
            connectHeaders: {
                Authorization: `Bearer ${token}`, // Заголовок авторизации
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log('Connected to WebSocket');

                // client.publish({
                //     destination: `${PREFIX}${TOPIC}`,
                //     body: JSON.stringify({ from, to }),
                //     headers: { 'content-type': 'application/json' },
                // });

                // Подписка на топик
                client.subscribe(`${QUEUE}${TOPIC}`, (message) => {
                    const newMessage: Message = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket error:', frame);
            }
        });

        client.activate();


        // Отключение при размонтировании компонента
        // return () => {
        //     if (client) {
        //         client.deactivate();
        //     }
        // };
    }, [token]);

    return (
        <div>
            <h2>WebSocket Messages</h2>
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
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </label>
            </div>
            {/*<button onClick={sendMessage} disabled={!connected || !from || !to}>*/}
            {/*    Send Message*/}
            {/*</button>*/}
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>From:</strong> {msg.from}, <strong>To:</strong> {msg.to}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Messages;