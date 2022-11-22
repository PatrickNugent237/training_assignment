import { useState } from "react";
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

    /// <summary>
    /// Handles changes in the username input field and sets the new username
    /// if it doesn't exceed the character limit.
    /// </summary>
    /// <param name="e">Event to retrieve new value from</param>
    const handleUsernameChange = (e) => {
      if(e.target.value.length <= 60) {
        setUsername(e.target.value);
      }
    };

    /// <summary>
    /// Handles changes in the password input field and sets the new password
    /// if it doesn't exceed the character limit.
    /// </summary>
    /// <param name="e">Event to retrieve new value from</param>
    const handlePasswordChange = (e) => {
      if(e.target.value.length <= 60) {
        setPassword(e.target.value);
      }
    };
  
    /// <summary>
    /// Handles submission of the login form by sending the currently entered
    /// username and password over to the backend in a POST request.
    /// </summary>
    /// <param name="e">Event to check if the form is empty</param>
    const handleSubmit = (e) => {
        e.preventDefault();

        fetch("http://localhost:8000/api/Authenticate.php", {
          method: 'POST',
          body: JSON.stringify({ username: username, password: password })
        }).then((res) => {
          if(res.status === 200) {
            console.log(res); 
            return res.json();
          }
          else if(res.status === 401) {
            setError("Incorrect username or password");
            throw new Error("Error: Failed to login");
          }
          else if(!res.ok) {
            setError("Error: Failed to login");
            throw new Error("Error: Failed to login");
          }
        })
        .then((data) => {
          console.log(data);
          setAuthenticated(true);
          setJWT(data);
          sessionStorage.setItem("authenticated", true);
          sessionStorage.setItem("jwt", data);
          navigate("/dashboard");
        })
        .catch((error) => {
          console.log(error);
        });
    };
  
    return (
    <div className = "login-container">
        <div className = "login-form">
            <form
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
