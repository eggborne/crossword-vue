<?php include("config.php");
  $userSql="SELECT * FROM `diagrams` ORDER BY id DESC";
  $userResult=mysqli_query($link,$userSql);

  if ($userResult) {
    while($row=mysqli_fetch_assoc($userResult)){
      $rows[] = $row;
    }
    echo json_encode($rows);
  }
	mysqli_close($link);
?>