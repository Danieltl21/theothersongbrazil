<?php
include("../template.php");
include("../froala.php")
?>

<script type="text/javascript">
	$("#cursos-link").addClass('btn-secondary').removeClass('btn-outline-secondary');

	$(function(){
		$(".fr-wrapper div:first-child").remove();
	})
</script>
	
<br><br>

<h2>Adicionar Curso</h2>

<br>

<form id="formCurso" enctype="multipart/form-data" autocomplete="off">

	<div class="form-row">
		<div class="form-group col-md-10 col-sm-12">
			<label for="nome-field">Nome do curso:</label>
			<input type="text" class="form-control" name="nome" id="nome-field" required="required"/>
		</div>
		<div class="form-group col-md-2 col-sm-12">
			<label for="posicao-field">Posição:</label>
		    <select class="form-control" name="posicao" id="posicao-field" required="required"/>
		    	<?php
		    		$queryCount = $conn->prepare('SELECT x.quantidade, nome FROM tbCurso, (select count(*) as quantidade FROM tbCurso) as x ORDER BY posicao ASC');
		    		
		    		$queryCount->execute();
		    		$result = $queryCount->fetch();

		    		$quantidade = intval($result["quantidade"]);
		    		
		    		for ($cont = 1; $cont <= $quantidade; $cont++) {
		    			if(!(isset($_POST['id']) && $_POST['posicao'] == $cont)){
		    				echo "<option value=\"".$cont."\">".$cont . " (" . $result['nome'] . ")</option>";
		    			}
		    			$result = $queryCount->fetch();
		    	   	}

		    	   	if(!isset($_POST['id'])){
		    	   		echo "<option value=\"" . ($quantidade + 1) . "\">" . ($quantidade + 1) . " (Vazio)</option>";
		    	   	}
		    	?>
			</select>
		</div>
	</div>
	


	<div class="form-group">
		<label for="tipo-field">Tipo do curso:</label>
		<select class="form-control" name="tipo" id="tipo-field">
		  <option value="null">Selecione</option>
		  <option value="Evento">Evento</option>
		  <option value="Curso em módulos">Módulos</option>
		  <option value="Curso semanal">Semanal</option>
		  <option value="Curso mensal">Mensal</option>
		</select>
	</div>
	

	<div class="form-group">
		<label for="img-field">Imagem:</label><br>
  		<input type="file" name="arquivo" id="img-field" onchange="showImg()"/>
	</div>

	<div class="form-group">
  		<label for="valor-field">Valor:</label>
		<input type="text" class="form-control" name="valor" id="valor-field" placeholder="Opcional" />
	</div>

	<div class="form-group">
  		<label for="local-field">Local:</label>
		<input type="text" class="form-control" name="local" id="local-field" placeholder="Opcional" />
	</div>

	<div class="form-group">
  		<label for="link-field">Link do PagSeguro:</label>
	    <input type="text" class="form-control" name="link" id="link-field" placeholder="Opcional" />
	</div>
    
	<div class="form-group">
  		<label for="instrutor-field">Instrutor:</label>
	    <select class="form-control" name="instrutor" id="instrutor-field">
	    	<option value="0" selected="">Nenhum</option>
			<?php
				$querySelect = $conn->prepare('SELECT * FROM tbInstrutores ORDER BY nome ASC');
				$querySelect->execute();
				while ($instrutor = $querySelect->fetch()) {
					echo "<option value=\"".$instrutor['id']."\">".$instrutor['nome']."</option>";
				}
			?>
		</select>
	</div>

  	<div id="editor">
	    <textarea name="conteudo" id='edit' style="margin-top: 30px;">
	      <h1>Título</h1>

		  	<p>Área pra colocar textos, entre outras coisas como:</p>

		  	<ul>
			    <li>Fotos</li>
			    <li>Vídeos</li>
			    <li>Arquivos</li>
			    <li>Links</li>
		 	</ul>

		  	<p>Também não precisa seguir exatamente esta estrutura, aproveite a diversidade de ações que este editor de texto te permite fazer.</p>
	    </textarea>
 	</div>

	<div class="form-group" style="text-align: center; margin-top: 50px; margin-bottom: 200px">
		<input type="submit" class="btn btn-primary btn-lg" value="Gravar curso" name="gravar_curso">
	</div>
</form>

<script type="text/javascript">
	$(document).ready(function() {
        $("#formCurso").submit(function(e){
        	e.preventDefault(e);

            var formdata = new FormData($("#formCurso")[0]);

            jQuery.ajax({
                url: 'sendForm.php',
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                type: 'POST', // For jQuery < 1.9
                success: function(data){
                    //window.location = '/admin/cursos';
                }
            });
        });
    });
</script>

</div>
</body>