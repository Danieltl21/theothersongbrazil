<?php
	session_start();

	if(!isset($_SESSION['login'])){
		header('location:/login.php');
	}
	if(isset($_GET['logout'])){
		session_destroy();
		header('location:/index.php');
	}

	require_once "../../connect.php";

	date_default_timezone_set('America/Sao_Paulo');
	$data_hoje = date('Y-m-d H:i');
?>
<head>
	<meta charset="utf-8">

	<title>Painel Administrativo - the other song brazil</title>

	<link rel="icon" href="./img/icone.png" type="image/png">

	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
	<script src="../../js/bootstrap.min.js"></script>

	<link rel="stylesheet" href="../../css/bootstrap.min.css"> 

	<style type="text/css">
		fieldset{
			    display: block;
	    -webkit-margin-start: 2px;
	    -webkit-margin-end: 2px;
	    -webkit-padding-before: 0.35em;
	    -webkit-padding-start: 0.75em;
	    -webkit-padding-end: 0.75em;
	    -webkit-padding-after: 0.625em;
	    min-width: -webkit-min-content;
	    border-width: 2px;
	    border-style: groove;
	    border-color: threedface;
	    border-image: initial;
		}

		/* Style the tab */
	.tab {
	    overflow: hidden;
	    border: 1px solid #ccc;
	    background-color: #f1f1f1;
	}

	/* Style the buttons that are used to open the tab content */
	.tab .tablinks {
		border-radius: 0;
		border:0;
	    float: left;
	    padding: 14px 16px;
	    transition: 0.3s;
	}

	/* Style the tab content */
	.tabcontent {
	    display: none;
	    padding: 6px 12px;
	    border: 1px solid #ccc;
	    border-top: none;
	}
	.tabcontent2 {
	    display: none;
	    padding: 6px 12px;
	    border: 0px solid #ccc;
	    border-top: none;
	}
	</style>
</head>
<body>
	<div class="container">
		<a href="?logout" style="float:right;">Fazer Logout</a>

		<h3 class="col col-sm-8" style="margin-top: 30px;">Painel Administrativo - the other song brazil</h3>

		<br>

		<div class="tab">
		  <a class="btn btn-outline-secondary tablinks" id="cursos-link" href="../cursos">Cursos</a>
		  <a class="btn btn-outline-secondary tablinks" id="bibliografias-link" href="../bibliografias">Bibliografias</a>
		  <a class="btn btn-outline-secondary tablinks" id="agenda-link" href="../agendas")">Agendas</a>
		  <a class="btn btn-outline-secondary tablinks" id="instrutores-link" href="../instrutores")">Instrutores</a>
		  <a class="btn btn-outline-secondary tablinks" id="modulos-link" href="../modulos">Módulos</a>
		  <a class="btn btn-outline-secondary tablinks" id="alunos-link" href="../alunos">Alunos</a>
		  <a class="btn btn-outline-secondary tablinks" id="controle-link" href="../controle">Controle</a>
		</div>