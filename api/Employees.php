<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

include_once '../config/Database.php';
include_once '../utilities/Utilities.php';

// Retrieve the secret for use in creating/validating JSON Web Tokens. 
// For security reasons, this is stored in a file outside of the project root.
$configDetails = parse_ini_file('../../config.ini');
$secret = $configDetails['secret'];

// Retrieve any data that might have been sent as part of a request
$data = json_decode(file_get_contents("php://input"));

/// <summary>
/// Takes in a skill level ID string and returns the associated skill level name.
/// </summary>
/// <param name="skillLevelID">The skill level ID</param>
/// <returns>The skill name associated with the ID</returns>
function determine_skill_Name($skillLevelID) {
  if($skillLevelID == "5aa7ba81-ecce-4143-84f1-2f70e9e247da") {
    return "Senior";
  }
  else if($skillLevelID == "c3551c4d-645b-4c47-8d30-ccbdcd4e2cfb") {
    return "Mid-level";
  }
  else {
    return "Junior";
  }  
}

/// <summary>
/// Takes in a number and returns yes or no depending on the value.
/// </summary>
/// <param name="active">The number to check</param>
/// <returns>"Yes" string if the value is "1", "No" otherwise</returns>
function determine_active_status($active) {
  if($active == 1) {
    return "Yes";
  }
  else {
    return "No";
  }
}

// Switch statement to handle requests differently based on the request
// method found (GET, POST, PUT, DELETE)
switch($_SERVER['REQUEST_METHOD']) {
  case 'GET':
    $jwt = $_GET['jwt'];

    $redis = new Redis();

    // Try connecting to the Redis server
    try {
      $redis->connect('127.0.0.1', 6379);

      // If the key (user's JWT) was found in the cache, just return the value
      // (employee data in this case)
      if ($redis->get($jwt)) {
        $employees = unserialize($redis->get($jwt)); 
        http_response_code(200);
        echo json_encode($employees);
        break;
      }
    }
    catch(RedisException $re) {
    }

    // Check if user's JWT is valid
    if(Utilities::is_jwt_valid($jwt, $secret)) {
      $sql = "SELECT * FROM `employees` WHERE 1";

      // Run SQL statement
      $con = Database::get_database_connection();
      $result = mysqli_query($con, $sql);

      // Die if SQL statement failed
      if (!$result) {
        http_response_code(404);
        die(mysqli_error($con));
        $con->close();
      }
      else {  
        $resultJson = array("data" => array());

        $rows = mysqli_fetch_assoc($result);
        if (!$rows) {
          echo "No results!";
        } 
        else {
          // Go through all of the rows from the query result and extract the
          // data from each row into a json array.
          do {
            $empId = Utilities::bin_to_uuid($rows['EmployeeID']);
            $firstName = $rows['FirstName'];
            $lastName = $rows['LastName'];
            $dob = $rows['DOB'];
            $email = $rows['Email'];
            $skillLevel = Utilities::bin_to_uuid($rows['SkillLevelID']);
            $active = $rows['Active'];
            $age = $rows['Age'];

            $skillLevel = determine_skill_Name($skillLevel);
            $active = determine_active_status($active);

            $resultJson["data"][] = array('employeeID' => $empId, 
              'firstName' => $firstName, 'lastName' => $lastName, 'dob' 
              => $dob, 'email' => $email, 'skillLevel' => $skillLevel,
              'active' => $active, 'age' => $age); 

          } while ($rows = mysqli_fetch_assoc($result));
        }

        // As this request was not found in the cache, try sending the key (user's JWT)
        // and value (employee data) to the Redis cache
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

      // Calculate current age from date of birth and current date
      $currentDate = new DateTime("now");
      $birthDate = new DateTime($dob);
      $age = $birthDate->diff($currentDate)->y;

      // Generate a GUID to use as the employee ID
      // Source: Michel Ayres, https://stackoverflow.com/questions/21671179/how-to-generate-a-new-guid
      $employeeID = sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), 
        mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), 
        mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), 
        mt_rand(0, 65535));

      $employeeBinID = Utilities::uuid_to_bin($employeeID);
      $skillLevelBinID = Utilities::uuid_to_bin($skillLevelID);

      $con = Database::get_database_connection();

      // Prepare and run SQL statement
      $stmt = $con->prepare("INSERT INTO `employees` (EmployeeID, FirstName, LastName, 
        DOB, Email, SkillLevelID, Active, Age) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("ssssssii", $employeeBinID, $firstName, $lastName, $dob, $email,
        $skillLevelBinID, $active, $age);

      if (!$stmt->execute()) {
        http_response_code(404);
        die(mysqli_error($con));
      }
      else {  
        http_response_code(200);
        echo json_encode($employeeID);
      }

      $stmt->close();
      $con->close();
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

      $skillLevelBinID = Utilities::uuid_to_bin($skillLevelID);

      // Calculate current age from date of birth and current date
      $currentDate = new DateTime("now");
      $birthDate = new DateTime($dob);
      $age = $birthDate->diff($currentDate)->y;

      $con = Database::get_database_connection();

      // Prepare and run SQL statement
      $stmt = $con->prepare("UPDATE `Employees` SET firstName=?, lastName=?,
        dob=?, email=?, skillLevelID=?, active=?,
        age=? WHERE employeeID=?");
      $stmt->bind_param("sssssiis", $firstName, $lastName, $dob, $email, 
        $skillLevelBinID, $active, $age, $employeeID);
            
      if (!$stmt->execute()) {
        http_response_code(404);
        die(mysqli_error($con));
      }
      else{  
        http_response_code(200);
      }

      $stmt->close();
      $con->close();
    }
    else {
      http_response_code(401);
    }

    break;
  case 'DELETE': 
    if(Utilities::is_jwt_valid($data->jwt, $secret)) {
      $employeeID = Utilities::uuid_to_bin($data->employeeID);

      $con = Database::get_database_connection();

      // Prepare and run SQL statement
      $stmt = $con->prepare("DELETE FROM `employees` WHERE employeeID=?");
      $stmt->bind_param("s", $employeeID);

      // Die if SQL statement failed
      if (!$stmt->execute()) {
        http_response_code(404);
        die(mysqli_error($con));
      }
      else {
        http_response_code(200);
      }

      $stmt->close();
      $con->close();
    }
    else {
      http_response_code(401);
    }

    break;
}
?>