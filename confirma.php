<!DOCTYPE html>
<html>
<head>
	<title>Confirmação de Inscrição - The Other Song Brazil</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">


    <link rel="icon" href="img/icone.png" type="image/png">

    <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Open+Sans:300,400">
    <link rel="stylesheet" href="font-awesome-4.6.3/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/bootstrap.min.css">                 
    <link rel="stylesheet" href="css/magnific-popup.css"> 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js" type="text/javascript"></script> 
    <link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="css/style.css"> 
    
     
    <?php
        include "connect.php";
    ?>
</head>
<body id="bg">
      	<?php
	date_default_timezone_set('America/Sao_Paulo');
$data_hoje = date('Y-m-d H:i');
?>
<div class="container-fluid">

            <section class="tm-content-box tm-banner margin-b-10">
                <div class="tm-banner-inner" style="background-image: url('img/fundo.png');">
                    <h1 class="tm-banner-title" style="background-color: rgba(255,255,255,1); padding: 12px;"><b>The Other Song Brazil</b></h1>                        
                </div>                    
            </section>
            <div class="col-sm-12" align="center">
            	
            	<?php
            		if (isset($_GET['a'])&&isset($_GET['c'])) {
            			$id_aluno=$_GET['a'];
            			$id_curso=$_GET['c'];
            			$curso44=$conn->prepare('SELECT * FROM tbCurso WHERE id=:pid ORDER BY nome ASC');
            			$curso44->bindValue(':pid', $id_curso);
						$curso44->execute();
						while ($rowCurso=$curso44->fetch()) {
							echo "<h1 align=\"center\">Preencha os campos para confirmar sua inscrição:</h1>";
							echo "<h1 align=\"center\">Curso: ".$rowCurso['nome']."</h1>";
							?>
							<img style="max-height: 400px;" src="<?php if($rowCurso['img']!=null){
                                          	echo "img/cursos/".$rowCurso['img'];}else{ echo "http://placehold.it/360x240";} ?>" alt="<?php echo $rowCurso['nome'] ?>" ><?
							echo "<fieldset><form action=\"confirma.php#cadModulo1\" method=\"post\" enctype=\"multipart/form-data\" align=\"center\">";

							if ($rowCurso['tipo']==2) {
								echo "<h3>Selecione os módulos de interesse:</h3>";
								$livros=$conn->prepare('SELECT * FROM tbModulos WHERE id_curso = :pid');
								$livros->bindValue(':pid',$rowCurso['id']);
								$livros->execute();
								echo "<input>";
								while ($categ=$livros->fetch()) {
									echo "<label>Módulo nº".$categ['numero']." - ".$categ['nome']."</label>";
									echo "<input type=\"checkbox\" name=\"array[]\" value=\"".$categ['id']."\"/>R$".$categ['valor'].",00 - <span>Módulo nº".$categ['numero']." - ".$categ['nome']."</span> <br><br>";
									$contDatass++;
								}
								if ($contDatass==0) {
									echo "Nenhum módulo cadastrado";
								}
								$contDatass=0;
								?>

								
								<?php
							}

                                        	$datas_curso=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso=:pid ORDER BY mes ASC');
												$datas_curso->bindValue(':pid',$rowCurso['id']);
												$datas_curso->execute();
												if ($contdatasa=$datas_curso->rowCount()!=0) {
													
												
                                        ?>
                                        <div class="form-group">
                                        	<h2>Selecionar data:</h2>
	                                        <select name="id_data" required="required" style="font-size: 1.4em;">
	                                        	
											<?php
												$datas_curso=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso=:pid ORDER BY mes ASC');
												$datas_curso->bindValue(':pid',$rowCurso['id']);
												$datas_curso->execute();
												while ($curs=$datas_curso->fetch()) {
													echo "<option value=\"".$curs['id']."\">".$curs['mes']." - ".$curs['dias']."</option>";
												}
											?>
											</select>
										</div>
										<?php
											}
										
											echo "<br><div class=\"form-group\" align=\"center\" style=\"display:grid;\"><input type=\"submit\" class=\"btn btn-success pull-xs-left tm-button tm-button-normal\" name=\"login\" style=\"font-size: 1.4em;\" value=\"Finalizar inscrição\" align=\"center\"/></div>";
								echo "</form></fieldset>";
							}
						}

					
				?>


            </div>

</div>
</body>
</html>