<?php include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
  $model = $postData['model'];
  $attribute = $postData['attribute'];

  $userSql="UPDATE `ai-models` SET model='$model' WHERE attribute='$attribute';";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    echo 'AI MODEL SAVED :)';
  }
	mysqli_close($link);
?>
