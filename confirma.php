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
                <div class="tm-banner-inner" style="background-image: url('img/page.jpg');">
                    <h1 class="tm-banner-title" style="background-color: rgba(255,255,255,1); padding: 12px;"><b>The Other Song Brazil</b></h1>                        
                </div>                    
            </section>
            <div class="col-sm-12" align="center">
            	
            	<?php
            		if (isset($_GET['cadastrado'])) {
            			echo "<h3 align=\"center\">Registro de conta realizado com sucesso.</h3>";
            		}
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
							echo "<input type=\"hidden\" name=\"id_curso\" value=\"".$id_curso."\">";
							echo "<input type=\"hidden\" name=\"id_aluno\" value=\"".$id_aluno."\">";
							if ($rowCurso['tipo']==2) {
								echo "<h3>Selecione os módulos de interesse:</h3>";
								$livros=$conn->prepare('SELECT * FROM tbModulos WHERE id_curso = :pid');
								$livros->bindValue(':pid',$rowCurso['id']);
								$livros->execute();
								while ($categ=$livros->fetch()) {
									echo "<br><label>Módulo nº".$categ['numero']." - ".$categ['nome']."</label><br>";
									echo "<input type=\"checkbox\" name=\"array[]\" value=\"".$categ['id']."\"/>R$".$categ['valor'].",00 - <span>Módulo nº".$categ['numero']." - ".$categ['nome']."</span> <br>";

									?>
										<div class="form-group">
                                        	<h5>Selecionar data do módulo <?php echo $categ['numero'] ?>:</h5>
	                                        <select name="id_datamodulo<?php echo $categ['id'] ?>" required="required" style="font-size: 0.9em;">
	                                        	
											<?php
												$datas_curso4=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso=:pid AND id_modulo=:pid_modulo ORDER BY mes ASC');
												$datas_curso4->bindValue(':pid',$rowCurso['id']);
												$datas_curso4->bindValue(':pid_modulo',$categ['id']);
												$datas_curso4->execute();
												while ($curs4=$datas_curso4->fetch()) {
													echo "<option value=\"".$curs4['id']."\">".$curs4['mes']." - ".$curs4['dias']." - ".$curs4['cidade']." - ".$curs4['local']."</option>";
												}
											?>
											</select>
										</div>


									<?php

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
												if ($contdatasa=$datas_curso->rowCount()!=0 && $rowCurso['tipo']!=2) {
													
												
                                        ?>
                                        <div class="form-group">
                                        	<h2>Selecionar data:</h2>
	                                        <select name="id_data" required="required" style="font-size: 1.4em;">
	                                        	<option value=""> </option>
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
										
											echo "<br><div class=\"form-group\" align=\"center\" style=\"display:grid;\"><input type=\"submit\" class=\"btn btn-success pull-xs-left tm-button tm-button-normal\" name=\"finaliza\" style=\"font-size: 1.4em;\" value=\"Finalizar inscrição\" align=\"center\"/></div>";
								echo "</form></fieldset>";
							}
						}

					
				?>


            </div>
            <section id="cadModulo1">
	            <?php
	            	if (isset($_POST['finaliza'])) {
	            		$valortotal=0;
	            		//Curso sem módulo
	            		if (isset($_POST['id_data'])) {
	            			$id_data=$_POST['id_data'];
	            			$id_curso=$_POST['id_curso'];
	            			$id_aluno=$_POST['id_aluno'];

	            			$grava3=$conn->prepare('INSERT INTO tbAluno (id, id_curso, datainscricao, valorpago, id_data, crx_tipo, crx_numero, usuario_id) VALUES (NULL, :pid_curso, :pdatainscricao, 0, :pid_data, NULL, NULL, :pid_usuario)');
								$grava3->bindValue(':pid_curso',$id_curso);
								$grava3->bindValue(':pid_usuario',$id_aluno);
								$grava3->bindValue(':pdatainscricao',$data_hoje);
								$grava3->bindValue(':pid_data',$id_data);
								$grava3->execute();

								$curso45=$conn->prepare('SELECT * FROM tbCurso WHERE id=:pid ORDER BY nome ASC');
		            			$curso45->bindValue(':pid', $id_curso);
								$curso45->execute();
								$rowValor=$curso45->fetch();
								$valorvalor=$rowValor['valor'];

	            		}
	            		//Curso com módulo
	            		if (isset($_POST['array'])) {
	            			$id_curso=$_POST['id_curso'];
	            			$id_aluno=$_POST['id_aluno'];
	            			foreach ($_POST['array'] as $key2) {

	            				//Valor módulos
	            				$livros34=$conn->prepare('SELECT * FROM tbModulos WHERE id = :pid');
								$livros34->bindValue(':pid',$key2);
								$livros34->execute();
								while ($rowValor=$livros34->fetch()) {
									$valortotal=$valortotal+$rowValor['valor'];
								}



	            				$aux="id_datamodulo".$key2;
	            				$data=$_POST["$aux"];
	            				$grava2=$conn->prepare('INSERT INTO tbAluno (id, id_curso, datainscricao, valorpago, id_modulo, id_data, crx_tipo, crx_numero, usuario_id) VALUES (NULL, :pid_curso, :pdatainscricao, 0, :pid_modulo, :pid_data, NULL, NULL, :pid_usuario)');
								$grava2->bindValue(':pid_curso',$id_curso);
								$grava2->bindValue(':pid_usuario',$id_aluno);
								$grava2->bindValue(':pdatainscricao',$data_hoje);
								$grava2->bindValue(':pid_modulo',$key2);
								$grava2->bindValue(':pid_data',$data);
								$grava2->execute();
													    
							}
							unset($key2);
	            		}
	            		
	            		if (!isset($_POST['id_data']) && !isset($_POST['array'])) {
	            			$id_curso=$_POST['id_curso'];
	            			$id_aluno=$_POST['id_aluno'];
	            			echo "<meta http-equiv=\"refresh\" content=0;url=\"confirma.php?a=".$id_aluno."&c=".$id_curso."\">";
						    echo"<script type='text/javascript'>";

								echo "alert('Selecionar pelo menos um módulo');";

							echo "</script>";
	            		}

	            		?>
	            		<div class="container col-sm-12" align="center">
		            		<div class="tm-box-pad tm-bordered-box">
	                            <h2 class="tm-section-title" align="center">Pré-inscrição realizada com sucesso. Obrigado!</h2>
	                            <h2 class="tm-section-title" align="center">Valor total à pagar: <?php if (isset($valorvalor)) {
	                            	echo $valorvalor;
	                            }else{
	                            	echo "R$".$valortotal.",00";
	                            }  ?></h2>
	                            <h3 class="tm-section-title" align="center">Faça um depósito na AGÊNCIA XXXX<br>
	                            C/C: XXXXXX-X<br>
	                        Banco Bradesco<br><br>*<strong>Não esqueça de enviar o comprovante para o e-mail: email@email.com.br</strong><br><strong>Enviar juntamente o número do CRO/CRM</strong></h3>
	                        </div>
                        </div>


	            		<?php 

	            	}
	            ?>
            </section>

</div>
</body>
</html>