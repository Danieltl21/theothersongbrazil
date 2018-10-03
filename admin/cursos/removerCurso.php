<?php
	require_once "../../connect.php";
	
	$query = $conn->prepare('DELETE FROM tbCurso WHERE id = :id');
	$query->bindValue(':id', $_POST["id"]);
	echo $query->execute();
?>