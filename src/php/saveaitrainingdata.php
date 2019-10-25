<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $trainingData = $postData['trainingData'];
  $attribute = $postData['attribute'];

  $userSql="UPDATE `ai-models` SET trainingData='$trainingData' WHERE attribute='$attribute';";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo 'AI TRAINING DATA SAVED :)';
  }
	mysqli_close($link);
?>
