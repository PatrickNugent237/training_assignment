<?php

class Database {
    private $con;

    /// <summary>
    /// Retrieves the database login details from an ini file stored outside of
    /// the root folder and creates a connection to the database.
    /// </summary>
    /// <returns>The created database connection</returns>
    public static function get_database_connection() {
        try {
            $configDetails = parse_ini_file('../../config.ini');
            $dbhost = $configDetails['dbhost'];
            $username = $configDetails['username'];
            $password = $configDetails['password'];
            $dbname = $configDetails['dbname'];
            $secret = $configDetails['secret'];
            $con = mysqli_connect($dbhost, $username, $password, $dbname);
      
            if (!$con) {
                die("Connection failed: " . mysqli_connect_error());
            }

            return $con;
        }
        catch(mysqli_sql_exception $mse) {
            http_response_code(404);
            die("Connection failed");
        }
    }
}
?>