<?php include("config.php");
	// $postData = json_decode(file_get_contents("php://input"), TRUE);
  // $cells = $postData['cells'];

  $userSql="SELECT * FROM `diagrams`";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    // echo json_encode(mysqli_fetch_array($userResult, MYSQLI_NUM));
    while($row=mysqli_fetch_assoc($userResult)){
      $rows[] = $row;
    }
    echo json_encode($rows);
  } else {
    echo 'DIAGRAM NOT SAVED.';
  }
	mysqli_close($link);
?>