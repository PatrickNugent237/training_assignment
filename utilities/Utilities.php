<?php

class Utilities {
    /// <summary>
    /// Encodes a string to base64 that is safe to use in URLs.
    /// </summary>
    /// <param name="str">String to encode</param>
    /// <returns>The base64 encoded from the string</returns>
    ///  Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
    public static function base64url_encode($str) {
        return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
    }

    /// <summary>
    /// Generates a JSON Web Token (JWT) for the logged in user to be used 
    /// for authentication.
    /// </summary>
    /// <param name="headers">The JWT headers</param>
    /// <param name="payload">The JWT payload</param>
    /// <param name="secret">The secret to be used (stored in a file outside of root)</param>
    /// <returns>The JWT created using the headers, payload and secret</returns>
    ///  Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
    public static function generate_jwt($headers, $payload, $secret) {
	    $headers_encoded = self::base64url_encode(json_encode($headers));
	
	    $payload_encoded = self::base64url_encode(json_encode($payload));
	
	    $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secret, true);
	    $signature_encoded = self::base64url_encode($signature);
	
	    $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";
	
	    return $jwt;
    }

    /// <summary>
    /// Checks whether a JSON Web Token (JWT) is valid by checking its signature 
    /// and expiry time.
    /// </summary>
    /// <param name="jwt">The JSON Web Token (JWT) to check</param>
    /// <param name="secret">The secret to be used (stored in a file outside of root)</param>
    /// <returns>False if the signature or expiry time is invalid, true otherwise</returns>
    ///  Source: https://roytuts.com/how-to-generate-and-validate-jwt-using-php-without-using-third-party-api/
    public static function is_jwt_valid($jwt, $secret) {
        // split the jwt
        $tokenParts = explode('.', $jwt);
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signature_provided = $tokenParts[2];
  
        // check the expiration time - note this will cause an error if there is no 'exp' claim in the jwt
        $expiration = json_decode($payload)->exp;
        $is_token_expired = ($expiration - time()) < 0;
  
        // build a signature based on the header and payload using the secret
        $base64_url_header = self::base64url_encode($header);
        $base64_url_payload = self::base64url_encode($payload);
        $signature = hash_hmac('SHA256', $base64_url_header . "." . $base64_url_payload, $secret, true);
        $base64_url_signature = self::base64url_encode($signature);
  
        // verify it matches the signature provided in the jwt
        $is_signature_valid = ($base64_url_signature === $signature_provided);
      
        if ($is_token_expired || !$is_signature_valid) {
            return FALSE;
        } else {
            return TRUE;
        }
    }

    /// <summary>
    /// Takes in a universally unique identifier (UUID) and turns it into 
    /// 16 byte binary form.
    /// </summary>
    /// <param name="uuid">The UUID to convert</param>
    /// <returns>the 16 byte binary form of the UUID</returns>
    /// Source: qdev, https://stackoverflow.com/questions/2839037/php-mysql-storing-and-retrieving-uuids
    public static function uuid_to_bin($uuid) {
        return pack("H*", str_replace('-', '', $uuid));
    }
  
    /// <summary>
    /// Takes in a 16 byte binary value and turns it into a universally 
    /// unique identifier (UUID)
    /// </summary>
    /// <param name="bin">The 16 byte binary value to convert</param>
    /// <returns>The UUID form of the 16 byte binary value</returns>
    /// Source: qdev, https://stackoverflow.com/questions/2839037/php-mysql-storing-and-retrieving-uuids
    public static function bin_to_uuid($bin) {
        return join("-", unpack("H8time_low/H4time_mid/H4time_hi/H4clock_seq_hi/H12clock_seq_low", $bin));
    }
}
?>