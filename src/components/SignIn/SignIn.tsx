import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignIn.css"; // Импортируем стили

const SignIn: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/auth/sign-in", {
                username: username,
                password: password,
            });
            localStorage.setItem("token", response.data.token); // Сохраняем токен
            navigate("/chats"); // Перенаправляем на защищенную страницу
        } catch (err) {
            setError("Неверный логин или пароль");
        }
    };

    return (
        <div className="signin-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Нет аккаунта? <a href="/sign-up">Зарегистрируйтесь</a>
            </p>
        </div>
    );
};

export default SignIn;