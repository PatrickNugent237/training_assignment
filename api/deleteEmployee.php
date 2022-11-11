<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');

$con = mysqli_connect("localhost", "root", "", "projectdb");

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

$employeeID = $_POST["employeeID"];
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

mysqli_free_result($result);

$con->close();

?>