<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

$ConfigDetails = parse_ini_file('../../config.ini');
$dbhost = $ConfigDetails['dbhost'];
$username = $ConfigDetails['username'];
$password = $ConfigDetails['password'];
$dbname = $ConfigDetails['dbname'];
$secret = $ConfigDetails['secret'];

//Checks whether a JWT is valid
//Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
function is_jwt_valid($jwt, $secret) {
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

  if ($is_token_expired || !$is_signature_valid) {
		return FALSE;
	} else {
		return TRUE;
	}
}

//Generates and returns a jwt
//Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
function generate_jwt($headers, $payload, $secret) {
	$headers_encoded = base64url_encode(json_encode($headers));
	
	$payload_encoded = base64url_encode(json_encode($payload));
	
	$signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
	$signature_encoded = base64url_encode($signature);
	
	$jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
	
	return $jwt;
}

//Encodes a string to base 64
//Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
function base64url_encode($str) {
  return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
}

$con;

try{
  $con = mysqli_connect($dbhost, $username, $password, $dbname);

  if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
  }
}
catch(mysqli_sql_exception $mse){
  http_response_code(404);
  die("Connection failed");
}

$data = json_decode(file_get_contents("php://input"));

$username = $data->username;
$password = $data->password;

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
    $headers = array('alg'=>'HS256','typ'=>'JWT');
    $payload = array('iss'=>'localhost','name'=>$username, 'exp'=>(time() + 3600));
    $jwt = generate_jwt($headers, $payload, $secret);

    if(is_jwt_valid($jwt, $secret))
    {
      http_response_code(200);
      echo json_encode($jwt);
    }
    else
    {
      http_response_code(401);
      echo json_encode("Invalid token generated");
    }
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