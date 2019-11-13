<?php include("config.php");

$postData = json_decode(file_get_contents("php://input"), TRUE);
$word = $postData['word'];
$tbl_name = $postData['length'];
$clues = $postData['clues'];
$author = $postData['author'];
$date = $postData['date'];


$sql = mysqli_query($link, "UPDATE `$db_name`.`$tbl_name` SET clues='$clues' WHERE word='$word';");

if($sql){
    echo 'Your clue was saved.';
}else{
    echo 'CLUE SAVE FAILED';
}
mysqli_close($link);
?>
