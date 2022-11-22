import { render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"
import AddEmployee from './AddEmployee';

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated") || false);
  const [jwt, setJWT] = useState(
    sessionStorage.getItem("jwt") || "");
  const [employeeData, setEmployeeData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showEmployeeTable, setShowEmployeeTable] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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
      {showEmployeeTable ? <table>
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
      </table> : null }
      <h1>{error}</h1>
      {showAddForm ? <AddEmployee/> : null}
      {showEmployeeTable ? <center><button className="dashboard-buttons" onClick={() => [setShowAddForm(true), setShowEmployeeTable(false)]}>Add new employee</button></center> : null } 
      {showEmployeeTable ?<center><button className="dashboard-buttons" onClick={Logout}>Log Out</button></center> : null}
      </div>
    );
  }
}

export default Dashboard;