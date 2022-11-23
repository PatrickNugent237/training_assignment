import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboard.css"
import EmployeeForm from './EmployeeForm';

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated") || false);
  const [jwt, setJWT] = useState(
    sessionStorage.getItem("jwt") || "");
  const [employeeData, setEmployeeData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [detailsToEdit, setDetailsToEdit] = useState({
    employeeID: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    skillLevel: "",
    active: "",
    age: "",
    requestType: ""
  });
  const [employeeTableVisible, setEmployeeTableVisible] = useState(true);
  const [employeeFormVisible, setEmployeeFormVisible] = useState(false);

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
      getEmployees();
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
      getEmployees();
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
  const getEmployees = () => {
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
  const logout = () => {
    setAuthenticated(false);
    setJWT("");
    sessionStorage.setItem("authenticated", false);
    sessionStorage.setItem("jwt", "");
    return <Navigate replace to="/login" />;
  }

  /// <summary>
  /// Shows the employee form and hides the employee table. Sets the details to be
  /// edited by the EmployeeForm component.
  /// </summary>
  /// <param name="details">The details of the employee in the current row (if editing)
  /// or an empty employee details object (if adding)</param>
  /// <param name="request">The request type to send to the EmployeeForm component. 
  /// "PUT" if the edit button was pressed or "POST" if the add button was pressed</param>
  /// </param>
  const showEmployeeForm = (details, request) => {

    setDetailsToEdit({
      ...detailsToEdit,
      employeeID: details.employeeID,
      firstName: details.firstName,
      lastName: details.lastName,
      dob: details.dob,
      email: details.email,
      skillLevel: details.skillLevel,
      active: details.active,
      age: details.age,
      requestType: request
    });
    setEmployeeTableVisible(false);
    setEmployeeFormVisible(true);
  }

  /// <summary>
  /// Shows the employee table and hides the employee form.
  /// </summary>
  const showEmployeeTable = () => {
    setEmployeeTableVisible(true);
    setEmployeeFormVisible(false);
  }

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else {
    return (
      <div className = "dashboard-container">
      <h3>Dashboard</h3>
      {employeeTableVisible ? <table>
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
            <td><button onClick={() => showEmployeeForm(item, "PUT") }>Edit</button>
            <button onClick={() => handleDelete(item.employeeID)}>Delete</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table> : null}
      <h1>{error}</h1>
      {employeeTableVisible ? <center><button className="dashboard-buttons" onClick={() => showEmployeeForm(detailsToEdit, "POST")}>Add new employee</button></center> : null}
      {employeeTableVisible ? <center><button className="dashboard-buttons" onClick={logout}>Log Out</button></center> : null}

      {employeeFormVisible ? <div className="employee-form">
      <EmployeeForm detailsToEdit={detailsToEdit}/>
      <button onClick={() => showEmployeeTable()}>Cancel</button>
      </div> : null}
      </div>
    );
  }
}

export default Dashboard;