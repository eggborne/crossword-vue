<?php
include("config.php");

$postData = json_decode(file_get_contents("php://input"), TRUE);
$attribute = $postData['attribute'];

$userSql="SELECT model FROM `ai-models` WHERE attribute='$attribute';";
$userResult=mysqli_query($link,$userSql);

if ($userResult){
  echo json_encode(mysqli_fetch_array($userResult)[0]);
}
mysqli_close($link);
?>
