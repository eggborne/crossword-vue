<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $trainingData = $postData['trainingData'];

  $userSql="UPDATE `ai-models` SET trainingData='$trainingData' WHERE id=1;";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo 'AI TRAINING DATA SAVED :)';
  }
	mysqli_close($link);
?>
