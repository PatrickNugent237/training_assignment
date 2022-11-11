<?php
header('Access-Control-Allow-Origin: *');

/*require_once realpath(__DIR__ . '../../vendor/autoload.php');

// Looing for .env at the root directory
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__);
$dotenv->load();

// Retrive env variable
$secret = $_ENV['JWT_SECRET'] ?? '';*/

function generate_jwt($headers, $payload, $secret = 'secret') {
	$headers_encoded = base64url_encode(json_encode($headers));
	
	$payload_encoded = base64url_encode(json_encode($payload));
	
	$signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
	$signature_encoded = base64url_encode($signature);
	
	$jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
	
	return $jwt;
}

function base64url_encode($str) {
  return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
}

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
    //echo "Logged in successfully";
    $secret = 'mVm3CSjaT2Q3Y0aqK0qcZVQ1lDFKa9HDQoEepZbVLzoav25ugriBy7kId9FkOMI';
    $headers = array('alg'=>'HS256','typ'=>'JWT');
    $payload = array('name'=>$username, 'exp'=>(time() + 60));

    $jwt = generate_jwt($headers, $payload);

    echo json_encode($jwt);

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