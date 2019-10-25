<?php include("config.php");
  $postData = json_decode(file_get_contents("php://input"), TRUE);
  $attribute = $postData['attribute'];

  $userSql="SELECT trainingData FROM `ai-models` WHERE attribute='$attribute';";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo json_encode(mysqli_fetch_array($userResult,MYSQLI_ASSOC)['trainingData']);
  }
	mysqli_close($link);
?>
