<?php
/*header('Access-Control-Allow-Origin: *');

$con = mysqli_connect("localhost", "root", "", "projectdb");

$method = $_SERVER['REQUEST_METHOD'];

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

$username = "";
$password = "";

switch ($method) {
    case 'GET':
      $sql = "SELECT * FROM `users` WHERE 1";
      break;
    case 'POST':
      $username = $_POST["username"];
      $password = $_POST["password"];
      $sql = "SELECT * FROM `users` WHERE username='$username' AND password='$password'";
      break;
}

// run SQL statement
$result = mysqli_query($con,$sql);

// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($con));
}

if ($method == 'GET') {
    //if (!$id) echo '[';
    for ($i=0 ; $i<mysqli_num_rows($result) ; $i++) {
      echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    //if (!$id) echo ']';
  } elseif ($method == 'POST') {

    $foundUser = mysqli_fetch_object($result);

    if($foundUser != NULL)
    {
      echo "Logged in successfully";
      http_response_code(200);
    }
    else
    {
      echo "Username or password is incorrect";
      http_response_code(401);
    }
  } else {
    echo mysqli_affected_rows($con);
  }

$con->close();*/

?>