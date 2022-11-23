import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import "./EmployeeForm.css"

export default function EditEmployee({detailsToEdit}){
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("authenticated") || false);
  const [jwt] = useState(
    sessionStorage.getItem("jwt") || "");
  const location = useLocation() || "";
  const [employeeData, setEmployeeData] = useState({
    employeeID: detailsToEdit.employeeID,
    firstName: detailsToEdit.firstName,
    lastName: detailsToEdit.lastName,
    dob: detailsToEdit.dob,
    email: detailsToEdit.email,
    skillLevel: detailsToEdit.skillLevel,
    active: detailsToEdit.active,
    age: detailsToEdit.age
  });
  const navigate = useNavigate();

  /// <summary>
  /// Handles changes in most of the input fields in the form for editing
  /// employees. Sets the new value in EmployeeData based on the name and 
  /// value retrieved from the event.
  /// </summary>
  /// <param name="e">Event to retrieve new value from</param>
  const handleFieldChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    if(value.length <=60){
      setEmployeeData({
        ...employeeData,
        [name]: value
      });
    }
  };

  /// <summary>
  /// Handles changes in the date input field and checks that the new date being
  /// set is not greater than the current date.
  /// </summary>
  /// <param name="e">Event to retrieve new value from</param>
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

  /// <summary>
  /// Handles changes in the "skill level" dropdown input field.
  /// </summary>
  /// <param name="option">The option chosen by the user</param>
  const handleSkillLevelSelect = (option) => {
    setEmployeeData({
        ...employeeData,
        skillLevel: option.label
    });
  };

  /// <summary>
  /// Handles changes in the "active" dropdown input field.
  /// </summary>
  /// <param name="option">The option chosen by the user</param>
  const handleActiveSelect = (option) => {
    setEmployeeData({
        ...employeeData,
        active: option.label
    });
  };

  /// <summary>
  /// Prepares entered employee data by formatting it for the backend and sends
  /// the data in a POST request to the backend. Handles response based on status code.
  /// </summary>
  /// <param name="e">Event to check if the form is empty</param>
  const handleSubmit = (e) => {
    e.preventDefault();
    
    var skillLevelID, active;

    if(employeeData.skillLevel === "Senior") {
        skillLevelID = "995112f0-5c57-11";
    }
    else if(employeeData.skillLevel === "Mid-level") {
        skillLevelID = "8dc2281d-5c57-11";
    }
    else {
        skillLevelID = "7cb03b1e-5c57-11";
    }

    if(employeeData.active === "Yes") {
      active = "1";
    }
    else {
      active = "0";
    }

    fetch("http://localhost:8000/api/Employees.php/" + employeeData.employeeID, {
      method: 'PUT',
      body: JSON.stringify({ employeeID: employeeData.employeeID,
        firstName: employeeData.firstName, lastName: employeeData.lastName,
        dob: employeeData.dob, email: employeeData.email, 
        skillLevelID: skillLevelID, active: active,
        age: employeeData.age, jwt: jwt
      })
    }).then((res) => {
      if(res.status === 200) {
        //return res.json();
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
    .then(() => {
      window.location.reload(false);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  /// <summary>
  /// useEffect hook that sets employee data to be edited (if any was sent) 
  /// when the page is loaded.
  /// </summary>
  useEffect(() => {
    if(location.state != null) {
      setEmployeeData(location.state.employeeData);
    }
  }, []);

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  } 
  else if(detailsToEdit === null) {
    return <Navigate replace to="/dashboard" />;
  }
  else {
    return (
      <div>
        <h3>Edit Employee Details</h3>
        <form
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
        <h1>{error}</h1>
      </div>
    );
}
}

//export default EditEmployee;