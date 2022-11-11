<?php
header('Access-Control-Allow-Origin: *');

$con = mysqli_connect("localhost", "root", "", "projectdb");

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM `employees` WHERE 1";

// run SQL statement
$result = mysqli_query($con,$sql);

// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($con));
}
else{  
  $resultJson = array("data" => array());

  $rows = mysqli_fetch_assoc($result);
    if (!$rows) {
        echo "No results!";
    } else {
          do {
            $empId = $rows['EmployeeID'];
            $firstName = $rows['FirstName'];
            $lastName = $rows['LastName'];
            $dob = $rows['DOB'];
            $email = $rows['Email'];
            $skillLevel = $rows['SkillLevelID'];
            $active = $rows['Active'];
            $age = $rows['Age'];

            if($skillLevel == "7cb03b1e-5c57-11")
            {
              $skillLevel = "Junior";
            }
            else if($skillLevel == "8dc2281d-5c57-11")
            {
              $skillLevel = "Mid-level";
            }
            else
            {
              $skillLevel = "Senior";
            }        

            $resultJson["data"][] = array('employeeID' => $empId, 
            'firstName' => $firstName, 'lastName' => $lastName, 'dob' 
            => $dob, 'email' => $email, 'skillLevelID' => $skillLevel,
            'active' => $active, 'age' => $age); 
          } while ($rows = mysqli_fetch_assoc($result));
    }

    http_response_code(200);
    echo json_encode($resultJson);
}

mysqli_free_result($result);

$con->close();

?>