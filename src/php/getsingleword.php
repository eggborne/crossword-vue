<?php include("config.php");
$postData = json_decode(file_get_contents("php://input"), TRUE);
$tbl_name = $postData['length'];
$word = $postData['word'];

$sql="SELECT * FROM `$db_name`.`$tbl_name` WHERE word='$word';";

$result=mysqli_query($link, $sql);

if ($result) {
  while($rows=mysqli_fetch_assoc($result)){
    echo json_encode($rows);
  }
} else {
  echo NULL;
}
mysqli_close($link);
?>
