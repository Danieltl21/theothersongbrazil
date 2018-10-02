<?php session_start();
	if(!isset($_SESSION['login'])){
		header('location:login.php');
	}
	if(isset($_GET['logout'])){
		session_destroy();
		header('location:index.php');
	}
	error_reporting(0);
@ini_set('display_errors', 0);
	require_once "connect.php";

?>
<div class="container">


<link rel="stylesheet" href="css/bootstrap.min.css"> 

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
.tab button {
    background-color: inherit;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    transition: 0.3s;
}

/* Change background color of buttons on hover */
.tab button:hover {
    background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
    background-color: #ccc;
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
<?php
	date_default_timezone_set('America/Sao_Paulo');
$data_hoje = date('Y-m-d H:i');
?>
<script src="http://js.nicedit.com/nicEdit-latest.js" type="text/javascript"></script>
<script type="text/javascript">bkLib.onDomLoaded(nicEditors.allTextAreas);</script>
<a href="painel.php?logout">Fazer Logout</a>
<h3>Olá, você logou no painel Administrativo - The Other Song Brazil. É recomendável o uso do navegador <span style="color: #d00">Google Chrome</span>.</h3>
<a href="painel.php">Recarregar</a><br><br/>
<div class="tab">
  <button class="tablinks" onclick="openMenu(event, '1Cursos')">Cursos</button>
  <button class="tablinks" onclick="openMenu(event, '1Bibliografias')">Bibliografias</button>
  <button class="tablinks" onclick="openMenu(event, '1Datas')">Datas/Horários/Cidades</button>
  <button class="tablinks" onclick="openMenu(event, '1Instrutores')">Instrutores</button>
  <button class="tablinks" onclick="openMenu(event, '1Modulos')">Módulos</button>
  <button class="tablinks" onclick="openMenu(event, '1Alunos')">Alunos</button>
</div>




<div id="1Cursos" class="tabcontent">
	<div class="row">
	<div class="col-sm-12">

<fieldset>
	<legend>Adicionar Curso</legend>
	<form action="#gravarCursoSection" method="post" enctype="multipart/form-data">
	<input type="text" name="nome_curso" placeholder="Nome do curso" style="width: 350px; height: 28px;" required="required"/><br/>
	<br>
	<span style="color: #d00">Tipo do curso: <br/></span>
	<select name="tipo">
		<option value="1">Curso semanal</option>
		<option value="2">Módulos - Cidades</option>
		<option value="3">Evento</option>
	</select>
	<br>
	<br>
	<label style="color: red">Imagem:</label><br>
  			<input type="file" name="arquivo" required="required" />
  			<br>
  			<br>
    <input type="text" name="subtitulo" placeholder="Sub-Título. Ex: Dr. Rajan Sankaran" style="width: 350px; height: 28px;"/><br/>
    <input type="text" name="valor" placeholder="Valor. Ex: 'R$200,00 por módulo'" style="width: 350px; height: 28px;"/><br/>
    <input type="text" name="link" placeholder="Link do pagseguro. Ex: https://pagseguro.com.br/G421Ed4" style="width: 350px; height: 28px;"/><br/>
    
    
    <span style="color: #d00">Instrutor (Selecione): - Opcional<br/></span>
    <select name="instrutor">
    	<option value="0" selected="">Nenhum</option>
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>
	<br>
	<br/>
	<span style="color: #d00">Conteúdo: <br/></span>
	<textarea name="conteudo" style="width: 800px; height: 450px;"></textarea>
	<br>
	<span style="color: #d00">Local: <br/></span>
    <textarea name="local" style="width: 500px; height: 250px;"></textarea><br/><br/>
	<input type="submit" value="Gravar curso" name="gravar_curso">
</form>
<section id="gravarCursoSection">
	<?php
		if(isset($_POST['gravar_curso'])){
			$conteudo = $_POST['conteudo'];
			$nome_curso=$_POST['nome_curso'];
			$subtitulo=$_POST['subtitulo'];
			$tipo=$_POST['tipo'];
			$valor = $_POST['valor'];
			$link=$_POST['link'];
			$local=$_POST['local'];
			$instrutor = $_POST['instrutor'];

			//img
			$_UP['pasta'] = 'img/cursos/';
			// Tamanho máximo do arquivo (em Bytes)
			$_UP['tamanho'] = 1024 * 1024 * 3; // 2Mb
			// Array com as extensões permitidas
			$_UP['extensoes'] = array('jpg', 'png', 'gif', 'jpeg');
			// Renomeia o arquivo? (Se true, o arquivo será salvo como .jpg e um nome único)
			$_UP['renomeia'] = false;
			// Array com os tipos de erros de upload do PHP
			$_UP['erros'][0] = 'Não houve erro';
			$_UP['erros'][1] = 'O arquivo no upload é maior do que o limite do PHP';
			$_UP['erros'][2] = 'O arquivo ultrapassa o limite de tamanho especifiado no HTML';
			$_UP['erros'][3] = 'O upload do arquivo foi feito parcialmente';
			$_UP['erros'][4] = 'Não foi feito o upload do arquivo';
			// Verifica se houve algum erro com o upload. Se sim, exibe a mensagem do erro
			if ($_FILES['arquivo']['error'] != 0) {
			  die("Não foi possível fazer o upload, erro:" . $_UP['erros'][$_FILES['arquivo']['error']]);
			  exit; // Para a execução do script
			}
			// Caso script chegue a esse ponto, não houve erro com o upload e o PHP pode continuar
			// Faz a verificação da extensão do arquivo
			$extensao = strtolower(end(explode('.', $_FILES['arquivo']['name'])));
			if (array_search($extensao, $_UP['extensoes']) === false) {
			  echo "Por favor, envie arquivos com as seguintes extensões: jpg, png ou gif";
			  exit;
			}
			// Faz a verificação do tamanho do arquivo
			if ($_UP['tamanho'] < $_FILES['arquivo']['size']) {
			  echo "O arquivo enviado é muito grande, envie arquivos de até 2Mb.";
			  exit;
			}
			// O arquivo passou em todas as verificações, hora de tentar movê-lo para a pasta
			// Primeiro verifica se deve trocar o nome do arquivo
			if ($_UP['renomeia'] == true) {
			  // Cria um nome baseado no UNIX TIMESTAMP atual e com extensão .jpg
			  $nome_final = md5(time()).$extensao;
			} else {
			  // Mantém o nome original do arquivo
			  $nome_final = $_FILES['arquivo']['name'];
			}

			//====
			if (move_uploaded_file($_FILES['arquivo']['tmp_name'], $_UP['pasta'] . $nome_final)) {



				$grava=$conn->prepare('INSERT INTO tbCurso (id, nome, img, subtitulo, conteudo, valor, link_pagamento, local, tipo, id_instrutor, created_at, last_update) VALUES (NULL, :pnome, :purl, :psubtitulo, :pconteudo, :pvalor, :plink_pagamento, :plocal, :ptipo, :pid_instrutor,:pdata, :pdata)');
		    $grava->bindValue(':pnome',$nome_curso);
		    $grava->bindValue(':purl',$nome_final);
		    $grava->bindValue(':psubtitulo',$subtitulo);
		    $grava->bindValue(':pconteudo',$conteudo);
		    $grava->bindValue(':pvalor',$valor);
		    $grava->bindValue(':plink_pagamento',$link);
		    $grava->bindValue(':plocal',$local);
		    $grava->bindValue(':ptipo',$tipo);
		    $grava->bindValue(':pid_instrutor',$instrutor);
		    $grava->bindValue(':pdata',$data_hoje);
		    $grava->execute();
		    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		   echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
			}
			else {
			  // Não foi possível fazer o upload, provavelmente a pasta está incorreta
			  echo"<script type='text/javascript'>";

				echo "alert('Não foi possível mover o arquivo');";

			echo "</script>";
			}





			

		}
	?>
</section>
</fieldset>
</div>
</div>
<div class="row">
	<div class="col-sm-6">
		<br>
		<h3>Alterar Curso</h3>
	<label>Selecione um curso ativado</label>
	
	<form action="painel.php#altCurso1" method="post" enctype="multipart/form-data">
	

		<select name="curso" required="required">
				<?php
					$curso44=$conn->prepare('SELECT * FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$curso44->execute();
					while ($curss=$curso44->fetch()) {
						echo "<option value=\"".$curss['id']."\">".$curss['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Próximo" name="altCurso">
	
			

		
</form>
	</div>
	<div class="col-sm-6">
	<h3>Ativar Curso</h3>
	<label>Selecione um curso desativado</label>
	
	<form action="painel.php#ativarCurso" method="post" enctype="multipart/form-data">
	

		<select name="curso" required="required">
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbCurso WHERE status=0 ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Ativar" name="atCurso">
	
			

		
</form>
<section id="ativarCurso">
	<?php
		if (isset($_POST['atCurso'])) {

			$key=$_POST['curso'];
					$excluirInstrutor=$conn->prepare('UPDATE tbCurso SET status = 1 WHERE id = :pid');
					$excluirInstrutor->bindValue(':pid', $key);
					$excluirInstrutor->execute();
					echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
				
			}
			
	?>
</section>
</div>
</div>
<div class="row">
	<div class="col-sm-6">
	<h3>Desativar Curso</h3>
	<label>Selecione um curso ativado</label>
	
	<form action="painel.php#desativarCurso" method="post" enctype="multipart/form-data">
	

		<select name="curso" required="required">
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Desativar" name="desatCurso">
	
			

		
</form>
<section id="desativarCurso">
	<?php
		if (isset($_POST['desatCurso'])) {

			$key=$_POST['curso'];
					$excluirInstrutor=$conn->prepare('UPDATE tbCurso SET status = 0 WHERE id = :pid');
					$excluirInstrutor->bindValue(':pid', $key);
					$excluirInstrutor->execute();
					echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
				
			}
			
	?>
</section>
</div>
<div class="col-sm-6">
	<h3 style="color: red;"><b>Excluir Curso Definitivamente</b></h3>
	<label>Selecione um curso - NECESSÁRIO ESTAR DESATIVADO</label>
	
	<form action="painel.php#excluirCurso" method="post" enctype="multipart/form-data">
	

		<select name="curso" required="required">
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbCurso WHERE status = 0 ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Excluir" name="excluirCurso">

			

		
</form>
<section id="excluirCurso">
	<?php
		if (isset($_POST['excluirCurso'])) {

			$key=$_POST['curso'];
					$excluirInstrutor=$conn->prepare('DELETE FROM tbCurso WHERE id = :pid');
					$excluirInstrutor->bindValue(':pid', $key);
					$excluirInstrutor->execute();
					echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
				
			}
			
	?>
</section>
</div>
</div>
</div>
<section id="altCurso1">
	<?php
		if (isset($_POST['altCurso'])) {
			echo "<br/><h3>Atualize os dados - Curso</h3>";
			$id=$_POST['curso'];
			$curso43=$conn->prepare('SELECT * FROM tbCurso WHERE id=:pid');
			$curso43->bindValue(':pid',$id);
					$curso43->execute();
					while ($dadoscurso=$curso43->fetch()) {


			?>
			<h4>Curso criado em: <?php echo $dadoscurso['created_at']; ?></h4>
			<form action="#gravarCurso99" method="post" enctype="multipart/form-data">
				<br/>
		    <span style="color: #d00">Nome do curso: <br/></span>
			<input type="text" name="nome_curso" placeholder="Nome do curso" value="<?php echo $dadoscurso['nome']; ?>" style="width: 350px; height: 28px;" required="required"/><br/>
		    <br/><br>
		    <span>Imagem atual</span><br>
		    <img src="img/cursos/<?php echo $dadoscurso['img'];?>" style="max-height: 100px;"><br>
		    <label style="color: red">Selecione uma imagem para alterar:</label><br>
  			<input type="file" name="arquivo" />
  			<br>
		    <span style="color: #d00">Subtítulo: <br/></span>
		    <input type="text" name="subtitulo" placeholder="Sub-Título. Ex: Dr. Rajan Sankaran" value="<?php echo $dadoscurso['subtitulo']; ?>" style="width: 350px; height: 28px;"/><br/>
		    <br/>
		    <span style="color: #d00">Valor: <br/></span>
		    <input type="text" name="valor" placeholder="Valor. Ex: 'R$200,00 por módulo'" value="<?php echo $dadoscurso['valor']; ?>" style="width: 350px; height: 28px;"/><br/>
		    <br/>
		    <span style="color: #d00">Link de pagamento: <br/></span>
		    <input type="text" name="link" placeholder="Link do pagseguro. Ex: https://pagseguro.com.br/G421Ed4" value="<?php echo $dadoscurso['link_pagamento']; ?>" style="width: 350px; height: 28px;"/><br/>
		    
		    <input type="hidden" name="id_curso11" value="<?php echo $dadoscurso['id']; ?>">
		    <br/>
		    <span style="color: #d00">Local do curso: <br/></span>
		    <textarea name="local"><?php echo $dadoscurso['local']; ?></textarea><br/><br/>
		    <span style="color: #d00">Instrutor (Selecione) - Opcional: <br/></span>
		    <select name="instrutor">

						<?php
							$instrutor=$conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
							$instrutor->execute();
							while ($inst=$instrutor->fetch()) {
								if ($inst['id']==$dadoscurso['id_instrutor']) {
									echo "<option value=\"".$inst['id']."\" selected=\"selected\">".$inst['nome']."</option>";
								}else{
									echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
								}
								
							}
						?>
					</select>
			<br>
			<br/>
			<span style="color: #d00">Conteúdo: <br/></span>
			<textarea name="conteudo" style="width: 800px; height: 450px;"><?php echo $dadoscurso['conteudo']; ?></textarea>
			<input type="submit" value="Gravar curso" name="gravar_curso99">
		</form>


	<?php
		}
	}

	?>
</section>
<section id="gravarCurso99">
		<?php
			if (isset($_POST['gravar_curso99'])) {

				$conteudo = $_POST['conteudo'];
			$nome_curso=$_POST['nome_curso'];
			$subtitulo=$_POST['subtitulo'];
			$valor = $_POST['valor'];
			$link=$_POST['link'];
			$local=$_POST['local'];
			$id=$_POST['id_curso11'];
			$instrutor = $_POST['instrutor'];

			if (!empty($_FILES['arquivo']['name'])) {
				//img
			$_UP['pasta'] = 'img/cursos/';
			// Tamanho máximo do arquivo (em Bytes)
			$_UP['tamanho'] = 1024 * 1024 * 3; // 2Mb
			// Array com as extensões permitidas
			$_UP['extensoes'] = array('jpg', 'png', 'gif', 'jpeg');
			// Renomeia o arquivo? (Se true, o arquivo será salvo como .jpg e um nome único)
			$_UP['renomeia'] = false;
			// Array com os tipos de erros de upload do PHP
			$_UP['erros'][0] = 'Não houve erro';
			$_UP['erros'][1] = 'O arquivo no upload é maior do que o limite do PHP';
			$_UP['erros'][2] = 'O arquivo ultrapassa o limite de tamanho especifiado no HTML';
			$_UP['erros'][3] = 'O upload do arquivo foi feito parcialmente';
			$_UP['erros'][4] = 'Não foi feito o upload do arquivo';
			// Verifica se houve algum erro com o upload. Se sim, exibe a mensagem do erro
			if ($_FILES['arquivo']['error'] != 0) {
			  die("Não foi possível fazer o upload, erro:" . $_UP['erros'][$_FILES['arquivo']['error']]);
			  exit; // Para a execução do script
			}
			// Caso script chegue a esse ponto, não houve erro com o upload e o PHP pode continuar
			// Faz a verificação da extensão do arquivo
			$extensao = strtolower(end(explode('.', $_FILES['arquivo']['name'])));
			if (array_search($extensao, $_UP['extensoes']) === false) {
			  echo "Por favor, envie arquivos com as seguintes extensões: jpg, png ou gif";
			  exit;
			}
			// Faz a verificação do tamanho do arquivo
			if ($_UP['tamanho'] < $_FILES['arquivo']['size']) {
			  echo "O arquivo enviado é muito grande, envie arquivos de até 2Mb.";
			  exit;
			}
			// O arquivo passou em todas as verificações, hora de tentar movê-lo para a pasta
			// Primeiro verifica se deve trocar o nome do arquivo
			if ($_UP['renomeia'] == true) {
			  // Cria um nome baseado no UNIX TIMESTAMP atual e com extensão .jpg
			  $nome_final = md5(time()).$extensao;
			} else {
			  // Mantém o nome original do arquivo
			  $nome_final = $_FILES['arquivo']['name'];
			}

			//====
			if (move_uploaded_file($_FILES['arquivo']['tmp_name'], $_UP['pasta'] . $nome_final)) {
				$grava=$conn->prepare('UPDATE tbCurso SET nome=:pnome, img=:purl, subtitulo=:psubtitulo, conteudo=:pconteudo, valor=:pvalor, link_pagamento=:plink_pagamento, local=:plocal, id_instrutor=:pid_instrutor, last_update=:pdata WHERE id=:pid');
		    $grava->bindValue(':pid',$id);
		    $grava->bindValue(':pnome',$nome_curso);
		    $grava->bindValue(':purl',$nome_final);
		    $grava->bindValue(':psubtitulo',$subtitulo);
		    $grava->bindValue(':pconteudo',$conteudo);
		    $grava->bindValue(':pvalor',$valor);
		    $grava->bindValue(':plink_pagamento',$link);
		    $grava->bindValue(':plocal',$local);
		    $grava->bindValue(':pid_instrutor',$instrutor);
		    $grava->bindValue(':pdata',$data_hoje);
		    $grava->execute();
		    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		   echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
				}else{
					echo"<script type='text/javascript'>";

				echo "alert('Não foi possível mover o arquivo');";

			echo "</script>";
				}
			}else{
				$grava=$conn->prepare('UPDATE tbCurso SET nome=:pnome, subtitulo=:psubtitulo, conteudo=:pconteudo, valor=:pvalor, link_pagamento=:plink_pagamento, local=:plocal, id_instrutor=:pid_instrutor, last_update=:pdata WHERE id=:pid');
		    $grava->bindValue(':pid',$id);
		    $grava->bindValue(':pnome',$nome_curso);
		    $grava->bindValue(':psubtitulo',$subtitulo);
		    $grava->bindValue(':pconteudo',$conteudo);
		    $grava->bindValue(':pvalor',$valor);
		    $grava->bindValue(':plink_pagamento',$link);
		    $grava->bindValue(':plocal',$local);
		    $grava->bindValue(':pid_instrutor',$instrutor);
		    $grava->bindValue(':pdata',$data_hoje);
		    $grava->execute();
		    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		   echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
			}

			




			

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>



<div id="1Instrutores" class="tabcontent">
<fieldset id="instrutoressss">
	<legend>Instrutores</legend>
	<div class="row">
	<div class="col-sm-12">
		<h3>Adicionar Instrutor</h3>
	<form action="painel.php#gravarInstrutor" method="post" enctype="multipart/form-data">
	<input type="text" name="nome_instrutor" placeholder="Nome do instrutor" style="width: 350px; height: 28px;" required="required"/><br/>
    <input type="text" name="link" placeholder="Link para saber mais" style="width: 350px; height: 28px;"/><br/>
    <textarea name="bio" style="width: 800px; height: 450px;"></textarea>
	<input type="submit" value="Gravar Instrutor" name="gravar_instrutor">
	</form>
	<section id="gravarInstrutor">
		<?php
			if (isset($_POST['gravar_instrutor'])) {
				$nome=$_POST['nome_instrutor'];
				$link=$_POST['link'];
				$bio=$_POST['bio'];
				$grava3=$conn->prepare('INSERT INTO tbInstrutores (id, nome, bio, link) VALUES (NULL, :pnome, :pbio, :plink)');
			    $grava3->bindValue(':pbio',$bio);
			    $grava3->bindValue(':pnome',$nome);
			    $grava3->bindValue(':plink',$link);
			    $grava3->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>
	</div>
</div>
<div class="row">
<div class="col-sm-6">
	<h3>Remover Instrutor</h3>
	<label>Selecione um instrutor</label>
	
	<form action="painel.php#remInstrutor1" method="post" enctype="multipart/form-data">
	

		<select name="instrutor" required="required">
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Remover" name="remInstrutor">
	
			

		
</form>
<section id="remInstrutor1">
	<?php
		if (isset($_POST['remInstrutor'])) {

			$key=$_POST['instrutor'];
					$excluirInstrutor=$conn->prepare('DELETE FROM tbInstrutores WHERE id = :pid');
					$excluirInstrutor->bindValue(':pid', $key);
					$excluirInstrutor->execute();
					echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
				
			}
			
	?>
</section>
</div>
<div class="col-sm-6">
	<h3>Alterar Instrutor</h3>
	<label>Selecione um instrutor</label>
	
	<form action="painel.php#altInstrutor1" method="post" enctype="multipart/form-data">
	

		<select name="instrutor" required="required">
				<?php
					$instrutor=$conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
						echo "<option value=\"".$inst['id']."\">".$inst['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Próximo" name="altInstrutor">
	
			

		
</form>

</div>
</div>
</fieldset>
</div>

<section id="altInstrutor1">
	<?php
		if (isset($_POST['altInstrutor'])) {
			echo "<br/><h3>Atualize os dados</h3>";
			$id=$_POST['instrutor'];
			$instrutor=$conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
					$instrutor->execute();
					while ($inst=$instrutor->fetch()) {
		

	?>
	<form action="painel.php#gravarInstrutor2" method="post" enctype="multipart/form-data">
	<input type="text" name="nome_instrutor" value="<?php echo $inst['nome'];?>" style="width: 350px; height: 28px;" required="required"/><br/>
    <input type="text" name="link" placeholder="Link para saiba mais" value="<?php echo $inst['link'];?>" style="width: 350px; height: 28px;"/><br/>
    <input type="hidden" name="id_instru" value="<?php echo $inst['id'];?>">
    <textarea name="bio" style="width: 350px; height: 450px;"><?php echo $inst['bio'];?></textarea>
	<input type="submit" value="Gravar Instrutor" name="gravar_instrutor2">
	</form>


	<?php
		}
	}

	?>
</section>
<section id="gravarInstrutor2">
		<?php
			if (isset($_POST['gravar_instrutor2'])) {
				$nome=$_POST['nome_instrutor'];
				$link=$_POST['link'];
				$bio=$_POST['bio'];
				$inst=$_POST['id_instru'];
				$grava3=$conn->prepare('UPDATE tbInstrutores SET nome = :pnome, bio = :pbio, link = :plink WHERE id = :pid');
			    $grava3->bindValue(':pid',$inst);
			    $grava3->bindValue(':pbio',$bio);
			    $grava3->bindValue(':pnome',$nome);
			    $grava3->bindValue(':plink',$link);
			    $grava3->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>


<div id="1Bibliografias" class="tabcontent">
<fieldset id="bibliosss">
	<legend>Bibliografia</legend>
	<div class="col-sm-6">
		<h3>Adicionar Bibliografia</h3>
	<form action="painel.php#gravarBibliografia" method="post" enctype="multipart/form-data">
	<input type="text" name="nome_livro" placeholder="Nome do livro" style="width: 350px; height: 28px;" required="required"/><br/>
    <input type="text" name="autor" placeholder="Autor" style="width: 350px; height: 28px;"/><br/>
    <label>Ao curso:</label>
    <select name="id_curso" required="required">
				<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status = 1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<option value=\"".$curs['id']."\">".$curs['nome']."</option>";
					}
				?>
			</select>
	<input type="submit" value="Gravar bibliografia" name="gravar_biblio">
	</form>
	<section id="gravarBibliografia">
		<?php
			if (isset($_POST['gravar_biblio'])) {
				$nome=$_POST['nome_livro'];
				$autor=$_POST['autor'];
				$id_curso=$_POST['id_curso'];
				$grava2=$conn->prepare('INSERT INTO tbBibliografia (id, id_curso, nome, autor) VALUES (NULL, :pid, :pnome, :pautor)');
			    $grava2->bindValue(':pid',$id_curso);
			    $grava2->bindValue(':pnome',$nome);
			    $grava2->bindValue(':pautor',$autor);
			    $grava2->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>
	</div>
<div class="col-sm-6">
	<h3>Remover Bibliografia</h3>
	<label>Selecione um curso</label>
	<div class="tab">
		<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<button class=\"tablinks\" onclick=\"openCity(event, 'curso".$curs['id']."')\">".$curs['nome']."</button>";
					}
				?>
	</div>
	<form action="painel.php#remBibliografia1" method="post" enctype="multipart/form-data">
	

	<?php
					$cursooo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursooo->execute();
					while ($curs2=$cursooo->fetch()) {
						echo "<div id=\"curso".$curs2['id']."\" class=\"tabcontent2\">";

						$livros=$conn->prepare('SELECT * FROM tbBibliografia WHERE id_curso = :pid');
						$livros->bindValue(':pid',$curs2['id']);
						$livros->execute();
						while ($categ=$livros->fetch()) {
							echo "<input type=\"checkbox\" name=\"array[]\" value=\"".$categ['id']."\"/> ".$categ['nome']." - ".$categ['autor']." / ";
						}

						echo "</div>";
					}
				?>



	<input type="submit" value="Próximo" name="remBiblio">
	
			

		
</form>
<section id="remBibliografia1">
	<?php
		if (isset($_POST['remBiblio'])) {
			if (isset($_POST['array'])) {
				foreach ($_POST['array'] as $key) {
					$excluirlivro=$conn->prepare('DELETE FROM tbBibliografia WHERE id = :pid');
					$excluirlivro->bindValue(':pid', $key);
					$excluirlivro->execute();
				}
				unset($key);
			}
			echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

		}

	?>
</section>
</div>
</fieldset>
</div>








<!-- Alunos -->
<div id="1Alunos" class="tabcontent">
	<br>
	<a href="painel.php?verMembros">Clique aqui para ver todos os membros do site</a>
	<br><br/>
		    <span style="color: #d00">Para verificar os alunos, selecione o curso: <br/></span>
	<form action="painel.php#verAlunos" method="post" enctype="multipart/form-data">
	

		<select name="curso" required="required">
				<?php
					$curso44=$conn->prepare('SELECT * FROM tbCurso ORDER BY nome ASC');
					$curso44->execute();
					while ($curss=$curso44->fetch()) {
						echo "<option value=\"".$curss['id']."\">".$curss['nome']."</option>";
					}
				?>
			</select>			
	



	<input type="submit" value="Próximo" name="verAlunosCurso">
		
</form>
</div>








<section id="verMembros">
	<?php 
	if (isset($_GET['verMembros'])&&isset($_SESSION['login'])) {
		?>
	<br><a href="painel.php">Voltar</a>
	<table border="1" width="100%">
	<tr>
		<th width="20%">Nome</th>
		<th width="10%">CPF</th>
		<th width="10%">CRM</th>
		<th width="10%">Telefone</th>
		<th width="15%">E-mail</th>
		<th>Cadastrado em</th>
	    <th style="background-color: red">Excluir</th>
	    
		
	</tr>

	<?php
		
			$reqAlunos2=$conn->prepare('SELECT * FROM tbUsuario ');
			$reqAlunos2->execute();
			while ($aluno=$reqAlunos2->fetch()) {
				
			
			?>

				<tr>
					<td width="20%">
						<?php echo $aluno['nome']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['cpf']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['endereco']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['telefone']; ?>
					</td>
					<td width="15%">
						<?php echo $aluno['email']; ?>
					</td>
					<td>
						<?php echo $aluno['created_at']; ?>
					</td>
					<td width="15%">
						<a href="painel.php?excluirmembro&id=<?php echo $aluno['id']; ?>">Excluir</a>
					</td>

				</tr>

			<?php
			}
		}

		
	?>
</section>
<section id="excluirmembro">
	<?php
		if (isset($_GET['excluirmembro'])&&isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$grava3=$conn->prepare('DELETE FROM tbUsuario WHERE id = :pid');
			$grava3->bindValue(':pid',$id);
			$grava3->execute();
			echo "<br><a href=\"painel.php#verMembros\">Voltar</a>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>



<section id="verAlunos">
	<?php 
	if (isset($_POST['verAlunosCurso'])) {

		$id_curso=$_POST['curso'];
		?>
	<br><a href="painel.php">Voltar</a>
	<table border="1" width="100%">
	<tr>
		<th width="20%">Nome</th>
		<th width="10%">CPF</th>
		<th width="10%">CRM</th>
		<th width="10%">Telefone</th>
		<th width="15%">E-mail</th>
		<th style="background-color: orange">STATUS PAGAMENTO</th>
		<th style="background-color: violet">Comparecimento</th>
	    <th style="background-color: red">Excluir</th>
	    
		
	</tr>

	<?php
		$reqAlunos=$conn->prepare('SELECT * FROM tbAluno WHERE id_curso=:pid ORDER BY usuario_id ASC');
		$reqAlunos->bindValue(':pid', $id_curso);
		$reqAlunos->execute();
		while ($aluno1=$reqAlunos->fetch()) {
			$reqAlunos2=$conn->prepare('SELECT * FROM tbUsuario WHERE id=:pid ORDER BY last_update DESC');
			$reqAlunos2->bindValue(':pid', $aluno1['usuario_id']);
			$reqAlunos2->execute();
			while ($aluno=$reqAlunos2->fetch()) {
				
			
			?>

				<tr>
					<td width="20%">
						<?php echo $aluno['nome']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['cpf']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['crm']; ?>
					</td>
					<td width="10%">
						<?php echo $aluno['telefone']; ?>
					</td>
					<td width="15%">
						<?php echo $aluno['email']; ?>
					</td>
					
						<?php 
							if (strcmp($aluno1['datapagamento'],"0000-00-00 00:00:00")==0) {
								?>
								<td style="background-color: orangered;">
									<b>
									Pagamento não registrado</b><br>
									<a href="painel.php?registrarpag&id=<?php echo $aluno1['usuario_id']; ?>&curso=<?php echo $id_curso; ?>">Registrar pagamento</a>
								</td>
								<?php
							}else{
								?>
								<td style="background-color: lawngreen;">
									Pagamento registrado<br>
									<a href="painel.php?cancelarpag&id=<?php echo $aluno1['usuario_id']; ?>&curso=<?php echo $id_curso; ?>">Cancelar pagamento</a>
								</td>
								<?php
							}
						?>
					
						<?php 
							if (strcmp($aluno1['datacomparecimento'],"0000-00-00")==0) {
								?><td style="background-color: orangered;">
									<b>Comparecimento não registrado</b><br>
									<a href="painel.php?registrarcomp&id=<?php echo $aluno1['usuario_id']; ?>&curso=<?php echo $id_curso; ?>">Confirmar comparecimento</a>
								</td>
								<?php
							}else{
								?>
								<td style="background-color: lawngreen;">
									Comparecimento registrado<br>
									<a href="painel.php?cancelarcomp&id=<?php echo $aluno1['usuario_id']; ?>&curso=<?php echo $id_curso; ?>">Cancelar comparecimento</a>
								</td>
								<?php
							}
						?>
					
					<td width="15%">
						<a href="painel.php?excluiralunocurso&id=<?php echo $aluno1['usuario_id']; ?>&curso=<?php echo $id_curso; ?>">Excluir</a>
					</td>

				</tr>

			<?php
			}
		}

		}
	?>
</section>




<section id="registrarpag">
	<?php
		if (isset($_GET['registrarpag'])&&isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$curso=$_GET['curso'];
			$grava3=$conn->prepare('UPDATE tbAluno SET datapagamento = :pdata WHERE usuario_id = :pid AND id_curso=:pcurso');
			$grava3->bindValue(':pid',$id);
			$grava3->bindValue(':pdata',$data_hoje);
			$grava3->bindValue(':pcurso',$curso);
			$grava3->execute();
			echo "<form method=\"POST\" action=\"painel.php#verAlunos\"><input type=\"hidden\" name=\"curso\" value=\"".$curso."\">
			<input type=\"submit\" value=\"Voltar\" name=\"verAlunosCurso\"></form>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>

<section id="cancelarpag">
	<?php
		if (isset($_GET['cancelarpag']) && isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$curso=$_GET['curso'];
			$grava3=$conn->prepare('UPDATE tbAluno SET datapagamento = :pdata WHERE usuario_id = :pid AND id_curso=:pcurso');
			$grava3->bindValue(':pid',$id);
			$grava3->bindValue(':pdata',"0000-00-00 00:00:00");
			$grava3->bindValue(':pcurso',$curso);
			$grava3->execute();
			echo "<form method=\"POST\" action=\"painel.php#verAlunos\"><input type=\"hidden\" name=\"curso\" value=\"".$curso."\">
			<input type=\"submit\" value=\"Voltar\" name=\"verAlunosCurso\"></form>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>


<section id="registrarcomp">
	<?php
		if (isset($_GET['registrarcomp'])&& isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$curso=$_GET['curso'];
			$grava3=$conn->prepare('UPDATE tbAluno SET datacomparecimento = :pdata WHERE usuario_id = :pid AND id_curso=:pcurso');
			$grava3->bindValue(':pid',$id);
			$grava3->bindValue(':pdata',$data_hoje);
			$grava3->bindValue(':pcurso',$curso);
			$grava3->execute();
			echo "<form method=\"POST\" action=\"painel.php#verAlunos\"><input type=\"hidden\" name=\"curso\" value=\"".$curso."\">
			<input type=\"submit\" value=\"Voltar\" name=\"verAlunosCurso\"></form>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>

<section id="cancelarcomp">
	<?php
		if (isset($_GET['cancelarcomp'])&&isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$curso=$_GET['curso'];
			$grava3=$conn->prepare('UPDATE tbAluno SET datacomparecimento = :pdata WHERE usuario_id = :pid AND id_curso=:pcurso');
			$grava3->bindValue(':pid',$id);
			$grava3->bindValue(':pdata',"0000-00-00");
			$grava3->bindValue(':pcurso',$curso);
			$grava3->execute();
			echo "<form method=\"POST\" action=\"painel.php#verAlunos\"><input type=\"hidden\" name=\"curso\" value=\"".$curso."\">
			<input type=\"submit\" value=\"Voltar\" name=\"verAlunosCurso\"></form>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>




<section id="excluiralunocurso">
	<?php
		if (isset($_GET['excluiralunocurso'])&&isset($_SESSION['login'])) {
			$id=$_GET['id'];
			$curso=$_GET['curso'];
			$grava3=$conn->prepare('DELETE FROM tbAluno WHERE usuario_id = :pid AND id_curso=:pcurso');
			$grava3->bindValue(':pid',$id);
			$grava3->bindValue(':pcurso',$curso);
			$grava3->execute();
			echo "<form method=\"POST\" action=\"painel.php#verAlunos\"><input type=\"hidden\" name=\"curso\" value=\"".$curso."\">
			<input type=\"submit\" value=\"Voltar\" name=\"verAlunosCurso\"></form>";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";
		}
	?>
</section>







<!-- Módulos -->

<div id="1Modulos" class="tabcontent">
<fieldset id="modulossss">
	<legend>Módulos</legend>
	<div class="col-sm-6">
		<h3>Adicionar Módulo</h3>
	<form action="painel.php#gravarModulo" method="post" enctype="multipart/form-data">
	<input type="number" name="numero" placeholder="Número do módulo" style="width: 350px; height: 28px;" required="required"/><br/>
	<input type="text" name="nome_livro" placeholder="Nome do módulo" style="width: 350px; height: 28px;" required="required"/><br/>
	<input type="number" name="valor" placeholder="Valor do módulo" style="width: 350px; height: 28px;" required="required"/><br/>
	<label>Conteúdo do módulo</label>
    <textarea name="conteudo" style="height: 400px; width: 400px;"></textarea>
    <label>Ao curso:</label>
    <select name="id_curso" required="required">
				<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status = 1 AND tipo = 2 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<option value=\"".$curs['id']."\">".$curs['nome']."</option>";
					}
				?>
			</select>
	<input type="submit" value="Gravar módulo" name="gravar_modulo">
	</form>
	<section id="gravarModulo">
		<?php
			if (isset($_POST['gravar_modulo'])) {
				$nome=$_POST['nome_livro'];
				$numero=$_POST['numero'];
				$conteudo=$_POST['conteudo'];
				$valor=$_POST['valor'];
				$id_curso=$_POST['id_curso'];
				$grava2=$conn->prepare('INSERT INTO tbModulos (id, id_curso, numero, nome, conteudo, valor) VALUES (NULL, :pid, :pnumero, :pnome, :pconteudo, :pvalor)');
			    $grava2->bindValue(':pid',$id_curso);
			    $grava2->bindValue(':pnome',$nome);
			    $grava2->bindValue(':pnumero',$numero);
			    $grava2->bindValue(':pconteudo',$conteudo);
			    $grava2->bindValue(':pvalor',$valor);
			    $grava2->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>
	</div>
<div class="col-sm-6">
	<h3>Remover Módulo</h3>
	<label>Selecione um curso</label>
	<div class="tab">
		<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 AND tipo=2 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<button class=\"tablinks\" onclick=\"openCity(event, 'curso6".$curs['id']."')\">".$curs['nome']."</button>";
					}
				?>
	</div>
	<form action="painel.php#remModulo1" method="post" enctype="multipart/form-data">
	

	<?php
					$cursooo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 AND tipo=2 ORDER BY nome ASC');
					$cursooo->execute();
					$contDatass=0;
					while ($curs2=$cursooo->fetch()) {
						echo "<div id=\"curso6".$curs2['id']."\" class=\"tabcontent2\">";

						$livros=$conn->prepare('SELECT * FROM tbModulos WHERE id_curso = :pid');
						$livros->bindValue(':pid',$curs2['id']);
						$livros->execute();
						while ($categ=$livros->fetch()) {
							echo "<input type=\"checkbox\" name=\"array[]\" value=\"".$categ['id']."\"/> Módulo nº".$categ['numero']." - ".$categ['nome']." / ";
							$contDatass++;
						}
						if ($contDatass==0) {
							echo "Nenhum módulo cadastrado";
						}
						$contDatass=0;
						echo "</div>";
					}
				?>



	<input type="submit" value="Remover" style="color: red;" name="remModulo">
	
			

		
</form>
<section id="remModulo1">
	<?php
		if (isset($_POST['remModulo'])) {
			if (isset($_POST['array'])) {
				foreach ($_POST['array'] as $key) {
					$excluirlivro=$conn->prepare('DELETE FROM tbModulos WHERE id = :pid');
					$excluirlivro->bindValue(':pid', $key);
					$excluirlivro->execute();
				}
				unset($key);
			}
			echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

		}

	?>
</section>
</div>
</fieldset>
</div>


<!-- End Módulos -->




<div id="1Datas" class="tabcontent">
<fieldset id="datassss">
	<legend>Datas e Horários</legend>
	<div class="row">
	<div class="col-sm-6">
		<h3>Adicionar data</h3>
	<form action="painel.php#gravarData" method="post" enctype="multipart/form-data">
	<input type="text" name="data1" placeholder="Mês" style="width: 350px; height: 28px;" required="required"/><br/>
    <input type="text" name="data2" placeholder="Dias (separados por vírgulas). Ex: 24, 25, 26" style="width: 350px; height: 28px;"/><br/>
    <fieldset>
    	<legend>Módulos - Opcional</legend>
    	<input type="text" name="data3" placeholder="Estado - Cidade" style="width: 350px; height: 28px;"/><br/>
    <input type="text" name="data4" placeholder="Local - Endereço" style="width: 350px; height: 28px;"/><br/>
    <select name="id_curso3">
    	<option selected="selected"> </option>
				<?php
					$cursoo=$conn->prepare('SELECT * FROM tbModulos ORDER BY numero ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<option value=\"".$curs['id']."\"> Módulo ".$curs['numero']." - ".$curs['nome']."</option>";
					}
				?>
			</select>
			<br>
    </fieldset>
    <label>Ao curso:</label>
    <select name="id_curso2" required="required">
				<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<option value=\"".$curs['id']."\">".$curs['nome']."</option>";
					}
				?>
			</select>
	<input type="submit" value="Gravar Data" name="gravar_data">
	</form>
	<section id="gravarData">
		<?php
			if (isset($_POST['gravar_data'])) {
				$nome=$_POST['data1'];
				$autor=$_POST['data2'];
				$id_curso2=$_POST['id_curso2'];
				$grava3=$conn->prepare('INSERT INTO tbDatas (id, id_curso, mes, dias) VALUES (NULL, :pid, :pnome, :pautor)');
			    $grava3->bindValue(':pid',$id_curso2);
			    $grava3->bindValue(':pnome',$nome);
			    $grava3->bindValue(':pautor',$autor);
			    $grava3->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>
	</div>

	<div class="col-sm-6">
	<h3>Remover Data</h3>
	<label>Selecione um curso</label>
	<div class="tab">
		<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<button class=\"tablinks\" onclick=\"openCity(event, 'curso2".$curs['id']."')\">".$curs['nome']."</button>";
					}
				?>
	</div>
	<form action="painel.php#remData1" method="post" enctype="multipart/form-data">
	

	<?php
					$cursooo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursooo->execute();
					$contDatass=0;
					while ($curs2=$cursooo->fetch()) {
						echo "<div id=\"curso2".$curs2['id']."\" class=\"tabcontent2\">";

						$livros=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso = :pid');
						$livros->bindValue(':pid',$curs2['id']);
						$livros->execute();
						while ($categ=$livros->fetch()) {
							echo "<input type=\"checkbox\" name=\"array2[]\" value=\"".$categ['id']."\"/> ".$categ['mes']." - ".$categ['dias']." / ";
							$contDatass++;
						}
						if ($contDatass==0) {
							echo "Nenhuma data cadastrada";
						}
						$contDatass=0;
						echo "</div>";
					}

				?>



	<input type="submit" value="Próximo" name="remData">
	
			

		
</form>
<section id="remData1">
	<?php
		if (isset($_POST['remData'])) {
			if (isset($_POST['array2'])) {
				foreach ($_POST['array2'] as $key2) {
					$excluirlivro=$conn->prepare('DELETE FROM tbDatas WHERE id = :pid');
					$excluirlivro->bindValue(':pid', $key2);
					$excluirlivro->execute();
				}
				unset($key2);
			}
			echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

		}

	?>
</section>
</div>
</div>
<!-- Horários -->
<div class="row">
<div class="col-sm-6">
		<h3>Adicionar Horários</h3>
	<form action="painel.php#gravarHorario" method="post" enctype="multipart/form-data">
	<input type="text" name="hora1" placeholder="Dia. Ex: Sexta-feira" style="width: 350px; height: 28px;" required="required"/><br/>
    <input type="text" name="hora2" placeholder="Horário. Ex: das 16:00 às 20:00" style="width: 350px; height: 28px;"/><br/>
    <label>Ao curso:</label>
    <select name="id_curso3" required="required">
				<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<option value=\"".$curs['id']."\">".$curs['nome']."</option>";
					}
				?>
			</select>
	<input type="submit" value="Gravar Horário" name="gravar_hora">
	</form>
	<section id="gravarHorario">
		<?php
			if (isset($_POST['gravar_hora'])) {
				$nome=$_POST['hora1'];
				$autor=$_POST['hora2'];
				$id_curso=$_POST['id_curso3'];
				$grava3=$conn->prepare('INSERT INTO tbHorarios (id, id_curso, dia, hora) VALUES (NULL, :pid, :pnome, :pautor)');
			    $grava3->bindValue(':pid',$id_curso);
			    $grava3->bindValue(':pnome',$nome);
			    $grava3->bindValue(':pautor',$autor);
			    $grava3->execute();
			    echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
			    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

			    //echo "<script type='javascript'>alert('Sucesso!');";
			}

		?>
	</section>
	</div>

	<div class="col-sm-6">
	<h3>Remover Horário</h3>
	<label>Selecione um curso</label>
	<div class="tab">
		<?php
					$cursoo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursoo->execute();
					while ($curs=$cursoo->fetch()) {
						echo "<button class=\"tablinks\" onclick=\"openCity(event, 'curso3".$curs['id']."')\">".$curs['nome']."</button>";
					}
				?>
	</div>
	<form action="painel.php#remHora1" method="post" enctype="multipart/form-data">
	

	<?php
					$cursooo=$conn->prepare('SELECT id,nome FROM tbCurso WHERE status=1 ORDER BY nome ASC');
					$cursooo->execute();
					$contDatass=0;
					while ($curs2=$cursooo->fetch()) {
						echo "<div id=\"curso3".$curs2['id']."\" class=\"tabcontent2\">";

						$livros=$conn->prepare('SELECT * FROM tbHorarios WHERE id_curso = :pid');
						$livros->bindValue(':pid',$curs2['id']);
						$livros->execute();
						while ($categ=$livros->fetch()) {
							echo "<input type=\"checkbox\" name=\"array3[]\" value=\"".$categ['id']."\"/> ".$categ['dia']." - ".$categ['hora']." / ";
							$contDatass++;
						}
						if ($contDatass==0) {
							echo "Nenhum horário cadastrado";
						}
						$contDatass=0;
						echo "</div>";
					}

				?>



	<input type="submit" value="Próximo" name="remHora">
	
			

		
</form>
<section id="remHora1">
	<?php
		if (isset($_POST['remHora'])) {
			if (isset($_POST['array3'])) {
				foreach ($_POST['array3'] as $key3) {
					$excluirlivro=$conn->prepare('DELETE FROM tbHorarios WHERE id = :pid');
					$excluirlivro->bindValue(':pid', $key3);
					$excluirlivro->execute();
				}
				unset($key3);
			}
			echo "<meta http-equiv=\"refresh\" content=0;url=\"painel.php\">";
		    echo"<script type='text/javascript'>";

				echo "alert('Sucesso');";

			echo "</script>";

		}

	?>
</section>
</div>
</div>
</fieldset>

</div>


</div>

<script>
function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent2");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
</script>
 <script>
function openMenu(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
</script>