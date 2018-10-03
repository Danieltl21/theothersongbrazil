<?php
	require_once "../../connect.php";


$nome=$_POST['nome'];
$posicao=$_POST['posicao'];
$tipo=$_POST['tipo'];
$valor = $_POST['valor'];
$local=$_POST['local'];
$link=$_POST['link'];
$instrutor = $_POST['instrutor'];
$conteudo = $_POST['conteudo'];
$last_update = $_POST['last_update'];

$data_hoje = date('Y-m-d H:i');
$nome_final;

if(isset($_FILES['arquivo'])){
	//img
	$_UP['pasta'] = '../../img/cursos/';
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

	move_uploaded_file($_FILES['arquivo']['tmp_name'], $_UP['pasta'] . $nome_final);
}


$grava=$conn->prepare('INSERT INTO tbCurso (nome, posicao, img, conteudo, valor, link_pagamento, local, tipo, id_instrutor, last_update) VALUES (:pnome, :pposicao, :purl, :pconteudo, :pvalor, :plink_pagamento, :plocal, :ptipo, :pid_instrutor, :pupdated)');
    $grava->bindValue(':pnome',$nome);
    $grava->bindValue(':pposicao', $posicao, PDO::PARAM_INT);
    $grava->bindValue(':purl', $nome_final);
    $grava->bindValue(':pconteudo',$conteudo);
    $grava->bindValue(':pvalor',$valor);
    $grava->bindValue(':plink_pagamento',$link);
    $grava->bindValue(':plocal',$local);
    $grava->bindValue(':ptipo',$tipo);
    $grava->bindValue(':pid_instrutor',(intval($instrutor) == 0 ? null : $instrutor), PDO::PARAM_INT);
    $grava->bindValue(':pupdated', ($last_update != null && !str.isEmpty() ? $last_update : $data_hoje));
    echo $grava->execute();
?>