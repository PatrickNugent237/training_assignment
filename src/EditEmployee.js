import { render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
//import axios from 'axios';
import $ from "jquery";
import { format } from 'date-fns'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const EditEmployee = () => {
  /*const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [active, setActive] = useState("");
  const [age, setAge] = useState("");*/
    
  const [result, setResult] = useState("");
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated")|| false);
  const [jwt, setJWT] = useState("");
    
  const location = useLocation();
  const [employeeData, setEmployeeData] = useState(location.state.employeeData);
  const navigate = useNavigate();

  const handleFieldChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    console.log("handling change with value of: " +  value + " and name of: " + name);
    console.log("first name: " + employeeData.firstName);

    setEmployeeData({
      ...employeeData,
      [name]: value
    });

    console.log("first name: " + employeeData.firstName);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    console.log(currentDate);

    if(value < currentDate)
    {
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

    if(employeeData.skillLevel == "Senior")
    {
        skillLevelID = "995112f0-5c57-11";
    }
    else if(employeeData.skillLevel == "Mid-level")
    {
        skillLevelID = "8dc2281d-5c57-11";
    }
    else
    {
        skillLevelID = "7cb03b1e-5c57-11";
    }

    if(employeeData.active == "Yes")
    {
      active = "1";
    }
    else
    {
      active = "0";
    }

    $.ajax({
        type: "PUT",
        url: "http://localhost:8000/api/Employees.php/" + employeeData.employeeID,
        data: JSON.stringify({ employeeID: employeeData.employeeID,
          firstName: employeeData.firstName, lastName: employeeData.lastName,
          dob: employeeData.dob, email: employeeData.email, 
          skillLevelID: skillLevelID, active: active,
          age: employeeData.age
        }),
        success(data) {
          setResult(data);
          setAuthenticated(true);
          setJWT(data);
          sessionStorage.setItem("authenticated", true);
          sessionStorage.setItem("jwt", data);
          navigate("/dashboard");
        },
    });
  };

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else {
    //const {employeeData} = state;
    return (
        <div className="App">
        <form
            action="http://localhost:8000/api/Employees.php"
            method="put"
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
        <h1>{result}</h1>
    </div>
    );
}
}

export default EditEmployee;