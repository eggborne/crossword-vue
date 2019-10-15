<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $cells = $postData['cells'];
  $width = $postData['width'];
  $height = $postData['height'];
  $creator = $postData['creator'];

  $userSql="INSERT INTO `$db_name`.`diagrams` (`cells`, `width`, `height`, `creator`) VALUES ('$cells', $width, $height, '$creator');";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo 'DIAGRAM SAVED :)';
  } else {
    echo 'DIAGRAM NOT SAVED.';
  }
	mysqli_close($link);
?>