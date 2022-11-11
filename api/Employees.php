<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

$con = mysqli_connect("localhost", "root", "", "projectdb");

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

$data = json_decode(file_get_contents("php://input"));

//Takes in a uuid and turns it into 16 bytes binary form
//Source: qdev, https://stackoverflow.com/questions/2839037/php-mysql-storing-and-retrieving-uuids
function uuid_to_bin($uuid){
  return pack("H*", str_replace('-', '', $uuid));
}

//Takes in a 16 bytes binary value and turns it into uuid form
//Source: qdev, https://stackoverflow.com/questions/2839037/php-mysql-storing-and-retrieving-uuids
function bin_to_uuid($bin){
  return join("-", unpack("H8time_low/H4time_mid/H4time_hi/H4clock_seq_hi/H12clock_seq_low", $bin));
}

switch($_SERVER['REQUEST_METHOD'])
{
  case 'GET':
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

          if($active == "1")
          {
            $active = "Yes";
          }
          else
          {
            $active = "No";
          }

          $empId = bin_to_uuid($empId);

          $resultJson["data"][] = array('employeeID' => $empId, 
            'firstName' => $firstName, 'lastName' => $lastName, 'dob' 
            => $dob, 'email' => $email, 'skillLevel' => $skillLevel,
            'active' => $active, 'age' => $age); 

        } while ($rows = mysqli_fetch_assoc($result));
      }

      http_response_code(200);
      echo json_encode($resultJson);
      mysqli_free_result($result);
    } 
    break;
  case 'POST': 
    $firstName = $data->firstName;
    $lastName = $data->lastName;
    $dob = $data->dob;
    $email = $data->email;
    $skillLevelID = $data->skillLevelID;
    $active = $data->active;
    $age = $data->age;

    //Calculate current age from date of birth and current date
    $currentDate = new DateTime("now");
    $birthDate = new DateTime($dob);
    $age = $birthDate->diff($currentDate)->y;

    //Generate a GUID to use as the employee ID
    //Source: Michel Ayres, https://stackoverflow.com/questions/21671179/how-to-generate-a-new-guid
    $employeeID = sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), 
    mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), 
    mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), 
    mt_rand(0, 65535));

    $employeeID = uuid_to_bin($employeeID);

    $sql = "INSERT INTO `employees` (EmployeeID, FirstName, LastName, DOB, Email, SkillLevelID, Active, Age) 
      VALUES ('$employeeID', '$firstName', '$lastName', '$dob', '$email', '$skillLevelID', '$active', '$age')";

    $result = mysqli_query($con,$sql);

    if (!$result) {
      http_response_code(401);
      die(mysqli_error($con));
    }
    else {  
      http_response_code(201);
    }

break;
    break;
  case 'PUT': 
    $employeeID = uuid_to_bin($data->employeeID);
    $firstName = $data->firstName;
    $lastName = $data->lastName;
    $dob = $data->dob;
    $email = $data->email;
    $skillLevelID = $data->skillLevelID;
    $active = $data->active;
    $age = $data->age;

    //Calculate current age from date of birth and current date
    $currentDate = new DateTime("now");
    $birthDate = new DateTime($dob);
    $age = $birthDate->diff($currentDate)->y;

    $sql = "UPDATE `Employees` SET firstName='$firstName', lastName='$lastName',
      dob='$dob', email='$email', skillLevelID='$skillLevelID', active='$active',
      age='$age' WHERE employeeID='$employeeID'";

    $result = mysqli_query($con,$sql);

    if (!$result) {
      http_response_code(401);
      die(mysqli_error($con));
    }
    else{  
      http_response_code(200);
    }

    break;
  case 'DELETE': 
    $employeeID = uuid_to_bin($data->employeeID);
    $sql = "DELETE FROM `employees` WHERE employeeID='$employeeID'";

    // run SQL statement
    $result = mysqli_query($con,$sql);

    // die if SQL statement failed
    if (!$result) {
      http_response_code(401);
      die(mysqli_error($con));
    }
    else{  
      http_response_code(200);
    }

    break;
}

$con->close();

?>