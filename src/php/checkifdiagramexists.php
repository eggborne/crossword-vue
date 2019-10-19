<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $cells = $postData['cells'];

  $userSql="SELECT id FROM `diagrams` WHERE cells='$cells';";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    // echo json_encode(mysqli_fetch_array($userResult, MYSQLI_NUM));
    echo json_encode(mysqli_fetch_array($userResult)[0]);
  }
	mysqli_close($link);
?>