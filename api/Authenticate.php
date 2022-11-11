<?php
header('Access-Control-Allow-Origin: *');

$con = mysqli_connect("localhost", "root", "", "projectdb");

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

$username = $_POST["username"];
$password = $_POST["password"];

$sql = "SELECT * FROM `users` WHERE username='$username'";

// run SQL statement
$result = mysqli_query($con,$sql);

// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($con));
}

$foundUser = mysqli_fetch_object($result);

if($foundUser != NULL)
{
  $hash = $foundUser->Password;

  if (password_verify($password, $hash)) {
    //mVm3CSjaT2Q3Y0aqK0qcZVQ1lDFKa9HDQoEepZbVLzoav25ugriBy7kId9FkOMI
    echo "Logged in successfully";
    http_response_code(200);
  } 
  else {
    echo "Username or password is incorrect";
    http_response_code(401);
  }
}
else
{
  echo "Username or password is incorrect";
  http_response_code(401);
}

$con->close();

?>