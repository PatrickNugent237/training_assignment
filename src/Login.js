import { useState } from "react";
import $ from "jquery";
import "./App.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState("");
    const [authenticated, setAuthenticated] = useState(
        sessionStorage.getItem("authenticated")|| false);
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
            success(data) {
                setResult(data);
                setAuthenticated(true);
                sessionStorage.setItem("authenticated", true);
                navigate("/dashboard");
            },
        });
    };
  
    return (
        <div className="App">
            <form
                action="http://localhost:8000/api/Authenticate.php"
                method="post"
                onSubmit={(event) => handleSubmit(event)}
            >
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
                <button type="submit">Submit</button>
            </form>
            <h1>{result}</h1>
        </div>
    );
}

export default Login;
