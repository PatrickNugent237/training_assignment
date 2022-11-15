import { useState } from "react";
import $ from "jquery";
import "./App.css";
import "./Login.css"
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [authenticated, setAuthenticated] = useState(
        sessionStorage.getItem("authenticated") || false);
    const [jwt, setJWT] = useState(
        sessionStorage.getItem("jwt") || "");
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = $(e.target);
        $.ajax({
            type: "POST",
            url: form.attr("action"),
            data: form.serialize(),
            statusCode: {
                200: function(data) {
                    console.log(data);
                    setAuthenticated(true);
                    setJWT(data);
                    sessionStorage.setItem("authenticated", true);
                    sessionStorage.setItem("jwt", data);
                    navigate("/dashboard");
                    //alert("Logged in successfully");
                },
                401: function() {
                    setError("Incorrect username or password")
                    alert("Error: failed to authenticate");
                }
            }
        });
    };
  
    return (
    <div className = "login-container">
        <div className = "login-form">
            <form
                action="http://localhost:8000/api/Authenticate.php"
                method="post"
                onSubmit={(event) => handleSubmit(event)}
            >
                <h3>User Login</h3>
                <label htmlFor="username">Username: </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(event) => handleUsernameChange(event)}
                />
                <label htmlFor="password">Password: </label>
                <input
                    type="text"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(event) => handlePasswordChange(event)}
                />
                <br />
                <button type="submit">Login</button>
            </form>
            <h1>{error}</h1>
        </div>
    </div>
    );
}

export default Login;
