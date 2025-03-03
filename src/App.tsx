import React from 'react';
import {Route, Routes} from "react-router-dom";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import Messages from "./components/Messages/Messages";

const App: React.FC = () => {
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    }

    return (
        <div>
            <Routes>
                <Route path={"/sign-in"} element={<SignIn/>}/>
                <Route path={"/sign-up"} element={<SignUp/>}/>
                <Route path={"/messages"} element={ isAuthenticated() ? <Messages /> : <SignIn/>}/>
                <Route path={"/"} element={ null }/>
            </Routes>
        </div>
    )
};

export default App;