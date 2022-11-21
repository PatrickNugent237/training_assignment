<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

include_once '../config/Database.php';
include_once '../utilities/Utilities.php';

$configDetails = parse_ini_file('../../config.ini');
$secret = $configDetails['secret'];

$data = json_decode(file_get_contents("php://input"));

//Takes in a skill level ID and returns the associated skill level name
function determine_skill_Name($skillLevelID) {
  if($skillLevelID == "7cb03b1e-5c57-11") {
    return "Junior";
  }
  else if($skillLevelID == "8dc2281d-5c57-11") {
    return "Mid-level";
  }
  else {
    return "Senior";
  }  
}

//Takes in a string and returns yes or no depending on the string passed in
function determine_active_status($active) {
  if($active == "1") {
    return "Yes";
  }
  else {
    return "No";
  }
}

switch($_SERVER['REQUEST_METHOD']) {
  case 'GET':
    $jwt = $_GET['jwt'];

    $redis = new Redis();

    try {
      $redis->connect('127.0.0.1', 6379);

      if ($redis->get($jwt)) {
        $employees = unserialize($redis->get($jwt)); 
        http_response_code(200);
        echo json_encode($employees);
        break;
      }
    }
    catch(RedisException $re) {
    }

    if(Utilities::is_jwt_valid($jwt, $secret)) {
      $sql = "SELECT * FROM `employees` WHERE 1";

      // run SQL statement
      $con = Database::get_database_connection();
      $result = mysqli_query($con ,$sql);

      $con->close();

      // die if SQL statement failed
      if (!$result) {
        http_response_code(404);
        die(mysqli_error($con));
      }
      else {  
        $resultJson = array("data" => array());

        $rows = mysqli_fetch_assoc($result);
        if (!$rows) {
          echo "No results!";
        } 
        else {
          do {
            $empId = $rows['EmployeeID'];
            $firstName = $rows['FirstName'];
            $lastName = $rows['LastName'];
            $dob = $rows['DOB'];
            $email = $rows['Email'];
            $skillLevel = $rows['SkillLevelID'];
            $active = $rows['Active'];
            $age = $rows['Age'];

            $skillLevel = determine_skill_Name($skillLevel);
            $active = determine_active_status($active);

            $empId = Utilities::bin_to_uuid($empId);

            $resultJson["data"][] = array('employeeID' => $empId, 
              'firstName' => $firstName, 'lastName' => $lastName, 'dob' 
              => $dob, 'email' => $email, 'skillLevel' => $skillLevel,
              'active' => $active, 'age' => $age); 

          } while ($rows = mysqli_fetch_assoc($result));
        }

        try {
          $redis->set($jwt, serialize($resultJson));
          $redis->expire($jwt, 10);
        }
        catch(RedisException $re) {
        }

        http_response_code(200);
        echo json_encode($resultJson);
        mysqli_free_result($result);
      } 
    }
    else {
      http_response_code(401);
    } 

    break;
  case 'POST': 
    if(Utilities::is_jwt_valid($data->jwt, $secret)) {
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

      $employeeBinID = Utilities::uuid_to_bin($employeeID);

      $sql = "INSERT INTO `employees` (EmployeeID, FirstName, LastName, DOB, Email, SkillLevelID, Active, Age) 
        VALUES ('$employeeBinID', '$firstName', '$lastName', '$dob', '$email', '$skillLevelID', '$active', '$age')";

      $con = Database::get_database_connection();
      $result = mysqli_query($con,$sql);

      $con->close();

      if (!$result) {
        http_response_code(401);
        die(mysqli_error($con));
      }
      else {  
        http_response_code(200);
        echo json_encode($employeeID);
      }
    }
    else {
      http_response_code(401);
    }

    break;
  case 'PUT': 
    if(Utilities::is_jwt_valid($data->jwt, $secret)) {
      $employeeID = Utilities::uuid_to_bin($data->employeeID);
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

      $con = Database::get_database_connection();
      $result = mysqli_query($con,$sql);

      $con->close();

      if (!$result) {
        http_response_code(401);
        die(mysqli_error($con));
      }
      else{  
        http_response_code(200);
      }
    }
    else {
      http_response_code(401);
    }

    break;
  case 'DELETE': 
    if(Utilities::is_jwt_valid($data->jwt, $secret)) {
      $employeeID = Utilities::uuid_to_bin($data->employeeID);
      $sql = "DELETE FROM `employees` WHERE employeeID='$employeeID'";

      // run SQL statement
      $con = Database::get_database_connection();
      $result = mysqli_query($con,$sql);

      $con->close();

      // die if SQL statement failed
      if (!$result) {
        http_response_code(401);
        die(mysqli_error($con));
      }
      else {
        http_response_code(200);
      }
    }
    else {
      http_response_code(401);
    }

    break;
}
?>