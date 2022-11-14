<?php
header('Access-Control-Allow-Origin: *');

/*require_once realpath(__DIR__ . '../../vendor/autoload.php');

// Looing for .env at the root directory
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__);
$dotenv->load();

// Retrive env variable
$secret = $_ENV['JWT_SECRET'] ?? '';*/

//Checks whether a JWT is valid
//Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
function is_jwt_valid($jwt, $secret = 'mVm3CSjaT2Q3Y0aqK0qcZVQ1lDFKa9HDQoEepZbVLzoav25ugriBy7kId9FkOMI') {
	// split the jwt
	$tokenParts = explode('.', $jwt);
	$header = base64_decode($tokenParts[0]);
	$payload = base64_decode($tokenParts[1]);
	$signature_provided = $tokenParts[2];

	// check the expiration time - note this will cause an error if there is no 'exp' claim in the jwt
	$expiration = json_decode($payload)->exp;
	$is_token_expired = ($expiration - time()) < 0;

	// build a signature based on the header and payload using the secret
	$base64_url_header = base64url_encode($header);
	$base64_url_payload = base64url_encode($payload);
	$signature = hash_hmac('SHA256', $base64_url_header . "." . $base64_url_payload, $secret, true);
	$base64_url_signature = base64url_encode($signature);

	// verify it matches the signature provided in the jwt
	$is_signature_valid = ($base64_url_signature === $signature_provided);
	
	/*if ($is_token_expired || !$is_signature_valid) {
		return FALSE;
	} else {
		return TRUE;
	}*/

  if (!$is_signature_valid) {
		return FALSE;
	} else {
		return TRUE;
	}
}

function generate_jwt($headers, $payload, $secret = 'mVm3CSjaT2Q3Y0aqK0qcZVQ1lDFKa9HDQoEepZbVLzoav25ugriBy7kId9FkOMI') {
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
    /*$secret = 'mVm3CSjaT2Q3Y0aqK0qcZVQ1lDFKa9HDQoEepZbVLzoav25ugriBy7kId9FkOMI';
    $headers = array('alg'=>'HS256','typ'=>'JWT');
    $payload = array('name'=>$username, 
      'exp'=>(time() + 60),
      'iss'=> "localhost",
      'iat'=> time()
    );*/

    $headers = array('alg'=>'HS256','typ'=>'JWT');
    $payload = array('sub'=>'1234567890','name'=>'John Doe', 'admin'=>true, 'exp'=>(time() + 60));
    $jwt = generate_jwt($headers, $payload);

    if(is_jwt_valid($jwt))
    {
      echo json_encode($jwt);
    }
    else
    {
      echo json_encode("Invalid token generated");
    }

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