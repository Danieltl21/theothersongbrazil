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