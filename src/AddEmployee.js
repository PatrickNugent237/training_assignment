import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import "./EmployeeForm.css"

const AddEmployee = () => {    
  const [error, setError] = useState("");
  const [authenticated] = useState(
    sessionStorage.getItem("authenticated")|| false);
  const [jwt] = useState(
    sessionStorage.getItem("jwt") || "");
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    skillLevel: "",
    active: "",
    age: ""
  });
  const navigate = useNavigate();

  const handleFieldChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    console.log("handling change with value of: " +  value + " and name of: " + name);
    console.log("first name: " + employeeData.firstName);

    if(value.length <=60) {
      setEmployeeData({
        ...employeeData,
        [name]: value
      });
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    console.log(currentDate);

    if(value < currentDate) {
      setEmployeeData({
        ...employeeData,
        dob: value
      });
    }
  };

  const handleSkillLevelSelect = (option) => {
    setEmployeeData({
        ...employeeData,
        skillLevel: option.label
    });
  };

  const handleActiveSelect = (option) => {
    setEmployeeData({
        ...employeeData,
        active: option.label
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    var skillLevelID, active;

    if(employeeData.skillLevel == "Senior") {
        skillLevelID = "995112f0-5c57-11";
    }
    else if(employeeData.skillLevel == "Mid-level") {
        skillLevelID = "8dc2281d-5c57-11";
    }
    else {
        skillLevelID = "7cb03b1e-5c57-11";
    }

    if(employeeData.active == "Yes") {
      active = "1";
    }
    else {
      active = "0";
    }

    fetch("http://localhost:8000/api/Employees.php", {
      method: 'POST',
      body: JSON.stringify({ employeeID: employeeData.employeeID,
        firstName: employeeData.firstName, lastName: employeeData.lastName,
        dob: employeeData.dob, email: employeeData.email, 
        skillLevelID: skillLevelID, active: active,
        age: employeeData.age, jwt: jwt 
      })
    }).then((res) => {
      if(res.status === 200) {
        //console.log(res);
        return res.json();
      }
      else if(res.status === 401) {
        setError("Error: failed to authenticate");
        throw new Error("Error: failed to authenticate");
      }
      else if(!res.ok) {
        setError("Error: Failed to add employee");
        throw new Error("Error: Failed to add employee");
      }
    })
    .then((data) => {
      console.log("Employee added with ID: " + data);
      navigate("/dashboard");
    })
    .catch((error) => {
      console.log(error);
    });
  };

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else {
    return (
      <div className="employee-container">
        <div className="employee-form">
        <h3>Add New Employee</h3>
        <form
            method="post"
            onSubmit={(event) => handleSubmit(event)}
        >
            <label htmlFor="firstName">First Name: </label>
            <input
                type="text"
                id="firstName"
                name="firstName"
                value={employeeData.firstName}
                onChange={handleFieldChange}
            />
            <label htmlFor="lastName">Last Name: </label>
            <input
                type="text"
                id="lastName"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleFieldChange}
            />
            <label htmlFor="dob">Date of Birth: </label>
            <input
                type="date"
                id="dob"
                name="dob"
                value={employeeData.dob}
                onChange={handleDateChange}
            />
            <label htmlFor="email">Email: </label>
            <input
                type="text"
                id="email"
                name="email"
                value={employeeData.email}
                onChange={handleFieldChange}
            />
            <label htmlFor="skillLevel">Skill Level: </label>
            <Dropdown
                menuClassName='dropdown-menu'
                controlClassName='dropdown-control'
                label="Skill Level"
                options={[
                  { label: 'Junior', value: 'junior' },
                  { label: 'Mid-level', value: 'mid-level' },
                  { label: 'Senior', value: 'senior' },
                ]}
                name="skillLevel"
                value={employeeData.skillLevel}
                onChange={handleSkillLevelSelect}
            />
            <label htmlFor="active">Active: </label>
            <Dropdown
                menuClassName='dropdown-menu'
                controlClassName='dropdown-control'
                label="Active"
                options={[
                  { label: 'Yes', value: 'yes' },
                  { label: 'No', value: 'no' },
                ]}
                name="active"
                value={employeeData.active}
                onChange={handleActiveSelect}
            />
            <br />
            <button type="submit">Submit</button>
        </form>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        <h1>{error}</h1>
        </div>
      </div>
    );
  }
}

export default AddEmployee;