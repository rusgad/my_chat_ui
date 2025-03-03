import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const SignUp: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/auth/sign-up", {
                'username': username,
                'email': email,
                'password': password,
            });
            localStorage.setItem("token", response.data.token); // Сохраняем токен
            navigate("/sign-in"); // Перенаправляем на защищенную страницу
        } catch (err) {
            setError("Неверные данные");
        }
    };

    return (
        <div>
            <h2>SignUp</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
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
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
};

export default SignUp;