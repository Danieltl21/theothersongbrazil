<?php

	$query_cursos_sql = "SELECT
		C.*,
		M.id AS Mid, M.id_curso AS Mid_curso, M.numero AS Mnumero, M.nome AS Mnome, M.conteudo AS Mconteudo, M.cidade AS Mcidade, M.valor AS Mvalor,
		D.id AS Did, D.id_curso AS Did_curso, D.id_modulo AS Did_modulo, D.mes AS Dmes, D.dias AS Ddias, D.horario AS Dhorario, D.status AS Dstatus,
		CB.id AS CBid, CB.curso_id AS CBcurso_id, CB.bibliografia_id AS CBbibliografia_id,
		B.id AS Bid, B.nome AS Bnome, B.autor AS Bautor,
		CI.id AS CIid, CI.id_curso AS CIid_curso, CI.id_instrutor AS CIid_instrutor,
		I.id AS Iid, I.nome AS Inome, I.bio AS Ibio, I.link AS Ilink
		FROM tbCurso AS C LEFT JOIN tbModulos AS M ON C.id = M.id_curso LEFT JOIN tbDatas AS D ON C.id = D.id_curso LEFT JOIN tbCursoBibliografia AS CB ON C.id = CB.curso_id LEFT JOIN tbBibliografia AS B ON B.id = CB.bibliografia_id LEFT JOIN tbCursoInstrutores AS CI ON C.id = CI.id_curso LEFT JOIN tbInstrutores AS I on I.id = CI.id_instrutor WHERE C.status=1 ORDER BY C.posicao ASC";

	$query_cursos = $conn->prepare($query_cursos_sql);
	$query_cursos->execute();

	$cursos = array();
	$cursoModel;

	$last_curso_id = 0;
	$last_modulo_id = 0;
	$last_data_id = 0;
	$last_bibliografia_id = 0;
	$last_instrutor_id = 0;

	while ($rowCurso = $query_cursos->fetch()) {
	    if($last_curso_id != $rowCurso["id"]){
	        if($last_curso_id != 0){
	            $cursos[$last_curso_id] = $cursoModel;
	        }

	        $cursoModel = array();
	        $last_curso_id = $rowCurso["id"];
	        $last_modulo_id = 0;
	        $last_bibliografia_id = 0;
	        $last_instrutor_id = 0;

	        $cursoModel["id"] = $rowCurso["id"];
	        $cursoModel["nome"] = $rowCurso["nome"];
	        $cursoModel["posicao"] = $rowCurso["posicao"];
	        $cursoModel["img"] = $rowCurso["img"];
	        $cursoModel["conteudo"] = $rowCurso["conteudo"];
	        $cursoModel["valor"] = $rowCurso["valor"];
	        $cursoModel["link_pagamento"] = $rowCurso["link_pagamento"];
	        $cursoModel["local"] = $rowCurso["local"];
	        $cursoModel["tipo"] = $rowCurso["tipo"];
	        $cursoModel["status"] = $rowCurso["status"];

	        if($rowCurso["Mid"] != null){
	        	$last_modulo_id = $rowCurso["Mid"];
	            $cursoModel["modulos"][$last_modulo_id] = createModulo($rowCurso);

	            if($rowCurso["Did"] != null){
					$last_data_id = $rowCurso["Did"];
	            	$cursoModel["modulos"][$last_modulo_id]["datas"][$last_data_id] = createData($rowCurso);
	        	}
	        } else {
	        	    if($rowCurso["Did"] != null){
						$last_data_id = $rowCurso["Did"];
	        	    	$cursoModel["datas"][$last_data_id] = createData($rowCurso);
	        		}
	        }
	        if($rowCurso["Bid"] != null){
			    $last_bibliografia_id = $rowCurso["Bid"];
	            $cursoModel["bibliografias"][$last_bibliografia_id] = createBibliografia($rowCurso);
	        }
	        if($rowCurso["Iid"] != null){
			    $last_instrutor_id = $rowCurso["Iid"];
	            $cursoModel["instrutores"][$last_instrutor_id] = createInstrutor($rowCurso);
	        }

	    } else {
	    	if($rowCurso["Mid"] != null && $rowCurso["Mid"] != $last_modulo_id){
	    		$last_modulo_id = $rowCurso["mid"];
	    	    $cursoModel["modulos"][$last_modulo_id] = createModulo($rowCurso);

	    	    if($rowCurso["Did"] != null && $rowCurso["Did"] != $last_data_id){
					$last_data_id = $rowCurso["Did"];
	    	    	$cursoModel["modulos"][$last_modulo_id]["datas"][$last_data_id] = createData($rowCurso);
	    		}
	    	} else {
	    		    if($rowCurso["Did"] != null && $rowCurso["Did"] != $last_data_id){
						$last_data_id = $rowCurso["Did"];
	    		    	$cursoModel["datas"][$last_data_id] = createData($rowCurso);
	    			}
	    	}
	    	if($rowCurso["Bid"] != null && $rowCurso["Bid"] != $last_bibliografia_id){
			    $last_bibliografia_id = $rowCurso["Bid"];
	    	    $cursoModel["bibliografias"][$last_bibliografia_id] = createBibliografia($rowCurso);
	    	}
	    	if($rowCurso["Iid"] != null && $rowCurso["Iid"] != $last_instrutor_id){
			    $last_instrutor_id = $rowCurso["Iid"];
	    	    $cursoModel["instrutores"][$last_instrutor_id] = createInstrutor($rowCurso);
	    	}
	    }
	}

	$cursos[$last_curso_id] = $cursoModel;

	function createModulo($resultSet){
	    $moduloModel["id"] = $resultSet["Mid"];
	    $moduloModel["numero"] = $resultSet["Mnumero"];
	    $moduloModel["nome"] = $resultSet["Mnome"];
	    $moduloModel["conteudo"] = $resultSet["Mconteudo"];
	    $moduloModel["cidade"] = $resultSet["Mcidade"];
	    $moduloModel["valor"] = $resultSet["Mvalor"];

	    return $moduloModel;
	}

	function createData($resultSet){
	    $dataModel["id"] = $resultSet["Did"];
	    $dataModel["mes"] = $resultSet["Dmes"];
	    $dataModel["dias"] = $resultSet["Ddias"];
	    $dataModel["horario"] = $resultSet["Dhorario"];
	    $dataModel["status"] = $resultSet["Dstatus"];

	    return $dataModel;
	}

	function createBibliografia($resultSet){
	    $bibliografiaModel["id"] = $resultSet["Bid"];
	    $bibliografiaModel["nome"] = $resultSet["Bnome"];
	    $bibliografiaModel["autor"] = $resultSet["Bautor"];

	    return $bibliografiaModel;
	}

	function createInstrutor($resultSet){
	    $instrutorModel["id"] = $resultSet["Iid"];
	    $instrutorModel["nome"] = $resultSet["Inome"];
	    $instrutorModel["bio"] = $resultSet["Ibio"];
	    $instrutorModel["link"] = $resultSet["Ilink"];

	    return $instrutorModel;
	}
?>