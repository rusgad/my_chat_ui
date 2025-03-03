import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export interface Chat {
    id: number;
    name: string;
}

export interface CreateChatRequest {
    chatName: string;
    participantUsernames: string[];
}

const ChatsList: React.FC = () => {
    const api = axios.create({
        baseURL: "http://localhost:8080",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const [chats, setChats] = useState<Chat[]>([]);
    const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false);
    const [chatName, setChatName] = useState<string>("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [newParticipant, setNewParticipant] = useState<string>("");
    const navigate = useNavigate(); // Хук для навигации

    // Получение списка чатов
    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await api.get<Chat[]>("/chat");
            setChats(response.data);
        } catch (error) {
            console.error("Ошибка при получении чатов:", error);
        }
    };

    // Обработка создания нового чата
    const handleCreateChat = async () => {
        if (!chatName || participants.length === 0) {
            alert("Название чата и участники обязательны!");
            return;
        }

        const newChat: CreateChatRequest = {
            chatName,
            participantUsernames: participants,
        };

        try {
            await api.post("/chat/create-new-chat", newChat);
            alert("Чат успешно создан!");
            setIsCreatingChat(false);
            setChatName("");
            setParticipants([]);
            fetchChats(); // Обновляем список чатов
        } catch (error) {
            console.error("Ошибка при создании чата:", error);
        }
    };

    // Добавление участника
    const addParticipant = () => {
        if (newParticipant.trim()) {
            setParticipants([...participants, newParticipant.trim()]);
            setNewParticipant("");
        }
    };

    // Удаление участника
    const removeParticipant = (username: string) => {
        setParticipants(participants.filter((p) => p !== username));
    };

    // Переход на страницу чата
    const handleChatClick = (chatName: string) => {
        navigate(`/chat/${chatName}`); // Переход на страницу чата
    };

    return (
        <div>
            <h1>Список чатов</h1>
            <ul>
                {chats.map((chat) => (
                    <li key={chat.id} onClick={() => handleChatClick(chat.name)} style={{cursor: "pointer"}}>
                        {chat.name}
                    </li>
                ))}
            </ul>

            <button onClick={() => setIsCreatingChat(true)}>Создать новый чат</button>

            {isCreatingChat && (
                <div>
                    <h2>Создание нового чата</h2>
                    <div>
                        <label>
                            Название чата:
                            <input
                                type="text"
                                value={chatName}
                                onChange={(e) => setChatName(e.target.value)}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Участники:
                            <input
                                type="text"
                                value={newParticipant}
                                onChange={(e) => setNewParticipant(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                            />
                            <button onClick={addParticipant}>Добавить</button>
                        </label>
                    </div>
                    <div>
                        <h3>Добавленные участники:</h3>
                        <ul>
                            {participants.map((username, index) => (
                                <li key={index}>
                                    {username}
                                    <button onClick={() => removeParticipant(username)}>Удалить</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={handleCreateChat}>Создать</button>
                    <button onClick={() => setIsCreatingChat(false)}>Отмена</button>
                </div>
            )}
        </div>
    );
};

export default ChatsList;