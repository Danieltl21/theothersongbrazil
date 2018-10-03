<?php include("../template.php") ?>

<script src="alterarStatus.js" type="text/javascript"></script>
<script src="removerCurso.js" type="text/javascript"></script>
<script src="../../js/bootstrap-alert.min.js" type="text/javascript"></script>
<script src="../../js/toaster.js" type="text/javascript"></script>
<script type="text/javascript">
	$("#cursos-link").addClass('btn-secondary').removeClass('btn-outline-secondary');
</script>

<link rel="stylesheet" href="../../css/bootstrap-alert.min.css">
<style type="text/css">
	#cursos-list td,
	#cursos-list th{
		text-align: center;
	}

	#cursos-list td:nth-child(2){
		text-align: initial;
	}

	#cursos-list td:nth-child(3){
		width: 110px;
	}

	#cursos-list td.ativado{
		color: green;
	}

	#cursos-list td.desativado{
		color: red;
	}
</style>

<table class="table" id="cursos-list">
 	<thead>
   		<tr>
     		<th>#</th>
		    <th>Nome</th>
		    <th>Status</th>
		    <th></th>
    	</tr>
  	</thead>
	<tbody>
	<?php
		$query = $conn->prepare('SELECT * FROM tbCurso ORDER BY posicao ASC');
		$query->execute();

		while ($curso = $query->fetch()) {
			$id = $curso['id'];
			$nome = $curso['nome'];
			$status = $curso["status"];
			$posicao = $curso['posicao'];


			echo "<tr id='$id'><th>".
				 $posicao.
				 "</th><td class='td-nome'>".
				 $nome.
				 "</td><td class='td-status " . ($status ? "ativado" : "desativado") . "'>".
				 ($status ? "Ativado" : "Desativado").
				 "</td><td class='td-buttons' style='width:1%;white-space:nowrap;'>".
				 "<button class='btn btn-sm btn-outline-primary' style='margin-right:2px;'>editar</button>".
				 "<button class='btn btn-sm btn-outline-warning' style='margin-right:2px;' onclick='alterarStatus($id, $status)'>".($status ? "desativar" : "ativar")."</button>".
				 "<button class='btn btn-sm btn-outline-danger' onclick='removerCurso($id, \"$nome\")'>remover</button>".
				 "</td></tr>";
		}
	?>
  	</tbody>
</table>

<a class="btn btn-primary btn-lg" href="formCurso.php">Adicionar novo</a>

</div>
</body>