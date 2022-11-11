
import { useState } from "react";
import $ from "jquery";
import "./App.css";
  
function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState("");
    const [authenticated, setauthenticated] = useState(localStorage.getItem(localStorage.getItem("authenticated")|| false));
  
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
  };
  
    const handleSumbit = (e) => {
        e.preventDefault();
        const form = $(e.target);
        $.ajax({
            type: "POST",
            url: form.attr("action"),
            data: form.serialize(),
            success(data) {
                setResult(data);
                setauthenticated(true)
                localStorage.setItem("authenticated", true);
            },
        });

        /*$.ajax({
            type: "GET",
            url: form.attr("action"),
            data: form.serialize(),
            success(data) {
                setResult(data);
            },
        });*/
    };
  
    return (
        <div className="App">
            <form
                action="http://localhost:8000/api/authenticateUser.php"
                method="post"
                onSubmit={(event) => handleSumbit(event)}
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
  
export default App;