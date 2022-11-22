import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboard.css"

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated") || false);
  const [jwt, setJWT] = useState(
    sessionStorage.getItem("jwt") || "");
  const [employeeData, setEmployeeData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  /// <summary>
  /// Sends a request to the backend to delete an employee and handles
  /// the response based on its status code.
  /// </summary>
  /// <param name="empID">ID of employee to delete</param>
  const handleDelete = (empID) => {
    console.log("handleDelete called with parameter: " + empID)
    console.log("body: " + JSON.stringify({ employeeID: empID }));
    console.log("jwt: " + jwt.toString());

    fetch("http://localhost:8000/api/Employees.php/" + empID, {
      method: 'DELETE',
      body: JSON.stringify({ employeeID: empID, jwt: jwt })
    }).then((res) => {
      if(res.status === 200) {
      }
      else if(res.status === 401) {
        setError("Error: failed to authenticate");
        throw new Error("Error: failed to authenticate");
      }
      else if(!res.ok) {
        setError("Error: Failed to delete employee");
        throw new Error("Error: Failed to delete employee");
      }
    })
    .then((data) => {
      console.log("employee deleted successfully with response: " + data);
      GetEmployees();
    })
    .catch((error) => {
      console.log(error);
    });
  };

  /// <summary>
  /// useEffect hook that calls function to get employees when page is loaded.
  /// </summary>
  useEffect(() => {
    if (authenticated) {
      console.log("authenticated, value is: " + authenticated);
      GetEmployees();
    }
    else {
      console.log("not authenticated, value is: " + authenticated);
      navigate("/login");
    }
  }, []);

  /// <summary>
  /// Sends a GET request to the backend to get a list of employee details and
  /// handles response based on status code. Called from useEffect hook.
  /// </summary>
  const GetEmployees = () => {
    fetch("http://localhost:8000/api/Employees.php" + "?jwt=" + encodeURIComponent(jwt).replaceAll('%22',''))
      .then((res) => {
        //res.json()
        if(res.status === 200) {
          return res.json();     
        }
        else if(res.status === 401) {
          setError("Failed to get list of employees: authentication failed");
          throw new Error("Failed to get list of employees: authentication failed");
          //throw new Error(res.status);
        }
        else if(!res.ok) {
          setError("Error: Failed to get list of employees");
          throw new Error("Error: Failed to get list of employees");
        }
      })
      .then((data) => {
        console.log(data);
        setEmployeeData(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /// <summary>
  /// Resets items in session storage related to authentication and redirects
  /// the user back to the login page. 
  /// </summary>
  const Logout = () => {
    setAuthenticated(false);
    setJWT("");
    sessionStorage.setItem("authenticated", false);
    sessionStorage.setItem("jwt", "");
    return <Navigate replace to="/login" />;
  }

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else {
    return (
      <div className = "dashboard-container">
      <h3>Dashboard</h3>
      <table>
        <tbody>
        <tr>
          <th>Employee ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Date of Birth</th>
          <th>Email</th>
          <th>Skill Level</th>
          <th>Active</th>
          <th>Age</th>
          <th>Options</th>
        </tr>
        {employeeData.map((item, index) => (
          <tr key={index}>
            <td>{item.employeeID}</td>
            <td>{item.firstName}</td>
            <td>{item.lastName}</td>
            <td>{item.dob}</td>
            <td>{item.email}</td>
            <td>{item.skillLevel}</td>
            <td>{item.active}</td>
            <td>{item.age}</td>
            <td><button onClick={() => navigate("/editEmployee", { state: { employeeData: item } })}>Edit</button>
            <button onClick={() => handleDelete(item.employeeID)}>Delete</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      <h1>{error}</h1>
      <center><button className="dashboard-buttons" onClick={() => navigate("/addEmployee")}>Add new employee</button></center>
      <center><button className="dashboard-buttons" onClick={Logout}>Log Out</button></center>
      </div>
    );
  }
}

export default Dashboard;