<?php
	require_once "../../connect.php";

	$sql = 'UPDATE tbCurso SET status = :status WHERE id = :id';
	$query = $conn->prepare($sql);
	$query->bindValue(':id', $_POST["id"]);
	$query->bindValue(':status', ($_POST["status"] ? "0" : "1"), PDO::PARAM_INT);
	echo $query->execute();
?>