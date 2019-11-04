<?php include("config.php");

$postData = json_decode(file_get_contents("php://input"), TRUE);
$word = $postData['word'];
$tbl_name = $postData['length'];


$sql = mysqli_query($link, "INSERT INTO `$db_name`.`$tbl_name` (`word`) VALUES ('$word');");

if($sql){
    echo 'Your word was saved.';
}else{
    echo 'WORD SAVE FAILED';
}
mysqli_close($dblink);
?>
