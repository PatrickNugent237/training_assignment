<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

include_once '../config/Database.php';
include_once '../utilities/Utilities.php';

// Retrieve the secret for use in creating/validating JSON Web Tokens. 
// For security reasons, this is stored in a file outside of the project root.
$configDetails = parse_ini_file('../../config.ini');
$secret = $configDetails['secret'];

$con = Database::get_database_connection();

// Retrieve any data that might have been sent as part of a request
$data = json_decode(file_get_contents("php://input"));

$username = $data->username;
$password = $data->password;

$sql = "SELECT * FROM `users` WHERE username='$username'";

// Run SQL statement
$result = mysqli_query($con,$sql);

// Die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($con));
}

$foundUser = mysqli_fetch_object($result);

if($foundUser != NULL) {
  $hash = $foundUser->Password;

  if (password_verify($password, $hash)) {
    $headers = array('alg'=>'HS256','typ'=>'JWT');
    $payload = array('iss'=>'localhost','name'=>$username, 'exp'=>(time() + 3600));
    $jwt = Utilities::generate_jwt($headers, $payload, $secret);

    if(Utilities::is_jwt_valid($jwt, $secret)) {
      http_response_code(200);
      echo json_encode($jwt);
    }
    else {
      http_response_code(401);
      echo json_encode("Invalid token generated");
    }
  } 
  else {
    echo "Username or password is incorrect";
    http_response_code(401);
  }
}
else {
  echo "Username or password is incorrect";
  http_response_code(401);
}

$con->close();

?>