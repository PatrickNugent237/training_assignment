import { render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
//import axios from 'axios';
import $ from "jquery";

const Dashboard = () => {
  //const [authenticated, setAuthenticated] = useState(null);
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated"));
  const [result, setResult] = useState([]);
  const navigate = useNavigate();

  /*const handleEditOption = (e) => {
    e.preventDefault();

    if (state.button === "edit") {
      console.log("Button 1 clicked!");
    }
    if (state.button === "delete") {
      const employeeID = $(e.target);
      $.ajax({
        type: "DELETE",
        url: "http://localhost:8000/api/deleteEmployee.php",
        data: employeeID.serialize(),
        success(data) {

        },
    });
    }
  };*/

  const handleDelete = (empID) => {
    //e.preventDefault();

    console.log("handleDelete called with parameter: " + empID)
    //const employeeID = $(e.target);

    console.log("body: " + JSON.stringify({ employeeID: empID }));

      $.ajax({
        type: "DELETE",
        url: "http://localhost:8000/api/Employees.php/" + empID,
        data: JSON.stringify({ employeeID: empID }),
        success(data) {
          console.log("employee deleted successfully with response: " + data)
        },
    });
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/Employees.php")
      .then((res) => res.json())
      .then(
        (data) => {
          console.log(data);
          setResult(data.data);
        },
        (error) => {
          console.log(error);
        }
      );
  }, []);

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else {
    return (
      <div>
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
        {result.map((item, index) => (
          <tr key={index}>
            <td>{item.employeeID}</td>
            <td>{item.firstName}</td>
            <td>{item.lastName}</td>
            <td>{item.dob}</td>
            <td>{item.email}</td>
            <td>{item.skillLevel}</td>
            <td>{item.active}</td>
            <td>{item.age}</td>
            <td><button onClick={() => navigate("/editEmployee", { state: { employeeData: item } })}>Edit</button></td>
            <td><button onClick={() => handleDelete(item.employeeID)}>Delete</button></td>
          </tr>
        ))}
        </tbody>
      </table>
      <center><button onClick={() => navigate("/addEmployee")}>Add new employee</button></center>
      </div>
    );
}
}

export default Dashboard;