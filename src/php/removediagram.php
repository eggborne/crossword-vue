<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $id = $postData['id'];

  $userSql="DELETE FROM `diagrams` WHERE `diagrams`.`id`=$id;";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo 'DIAGRAM DELETED :)';
  }
	mysqli_close($link);
?>