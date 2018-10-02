<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>The Other Song Brazil</title>

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
      <style type="text/css">
      	#bg {
		  background-size: cover;
		  background-attachment: fixed;
		  background-image:linear-gradient(rgba(255, 244, 233, 1), rgba(255,244,233,0.7));
		    background-repeat: no-repeat;
		}
		.tabcontent2 {
    display: none;
    padding: 6px 12px;
    border: 0px solid #ccc;
    border-top: none;

}
@media (min-width: 767px) {
    .col-sm-4{
    width: 32.23333333%;
}
}

a {
    font-size: 1.5em;
}



/* Global */

img { max-width:100%; }






/* Boxes
------------------------------------------------ */

/* List style */
ul.thumbnails { 
  list-style: none; 
  margin: 0;
  padding: 0;
  }

.caption-box h4 {
    font-size: 1.6rem;
    color: #444;
    }
    .caption-box p {
        font-size: 1.3rem;
        color: #999;
        }
        .btn.btn-mini {
            font-size: 0.63rem;
            }



/* Control box 
------------------------------------------------ */
.control-box {
    width: 100%;
    }
    .carousel-control{
        background: white !important;
        border: 0px;
        border-radius: 0px;
        display: inline-block;
        font-size: 34px;
        font-weight: 200;
        line-height: 18px;
        opacity: 0.9;
        padding: 4px 10px;
        margin: 30px -20px 0;
        height: 30px;
        width: 30px;
        }



/* Mobile only
------------------------------------------------ */
@media (max-width: 767px) {
    .page-header { text-align: center; } 
}
@media (max-width: 479px) {
    .caption-box { word-break: break-all; }
    ul.thumbnails li { margin-bottom: 30px; }
}





      </style>
      <body id="bg">
      	<?php
	date_default_timezone_set('America/Sao_Paulo');
$data_hoje = date('Y-m-d H:i');
?>
        <div class="container-fluid">

            <section class="tm-content-box tm-banner margin-b-10">
                <div class="tm-banner-inner" style="background-image: url('img/fundo.png');">
                    <h1 class="tm-banner-title" style="background-color: rgba(255,255,255,0.3); padding: 12px;"><b>The Other Song Brazil</b></h1>                        
                </div>                    
            </section>

            <div class="tm-body">
                <div class="tm-box-pad tm-bordered-box" style="height: 50px; background-color: rgba(105, 63, 16, 1); margin-bottom: 15px; border-radius: 7px;">
                                <h1 class="tm-section-title" align="center" style="margin-top: -5px;font-size: 2em; color: white; margin-top: -16px;"><b>ESCOLHA O CURSO:</b></h1>
                            </div>
                <div class="tm-main-content">
                	
                        <!-- <img src="img/fundo.png" alt="The Other Song Brazil" class="img-fluid tm-welcome-img" style="height: 400px;">       

                                       
                        <div class="tm-welcome-boxes-container">
                            <?php
                            // $contCursos=1;
                            // $exib=$conn->prepare("SELECT * FROM curso WHERE status=1");
                            // $exib->execute();
                            // while ($rowCurso=$exib->fetch()) {
                            	
                            //     echo "<div class=\"tm-welcome-box\">
                            //     <div class=\"tm-welcome-text\">
                            //         <h2 class=\"tm-section-title \">".$rowCurso['nome']."</h2>
                            //         <p>".$rowCurso['subtitulo']."</p>    
                            //     </div>                            
                            //     <a href=\"#Curso".$contCursos."Section\" onclick=\"openCity(event, 'Curso".$contCursos."')\" class=\"tm-welcome-link tm-button tablinks\">Saiba mais</a>
                            // </div>";
                            // if ($contCursos%3==0) {
                            // 		echo "<br>";
                            // 	}
                            // $contCursos++;
                            // }
                            ?>
                        </div> -->



                        <div id="myCarousel" class="row carousel slide" data-ride="carousel" style="padding-left: 20px;padding-right: 20px;">


    <!-- Wrapper for slides -->
    <div class="carousel-inner">
        
        <?php
                            $contCursos=1;
                            $totalCursos=0;
                            $exib=$conn->prepare("SELECT * FROM tbCurso WHERE status=1");
                            $exib->execute();
                            $totalCursos=$exib->rowCount();
                            while ($rowCurso=$exib->fetch()) {
                                if ($contCursos==1) {
                                    echo "<div class=\"item active\">
        
                                    <ul class=\"thumbnails\">";
                                }
                                ?>
                                    <li class="col-sm-4" style=" background-color: rgba(105, 63, 16, 1);border-radius: 7px;padding: 5px; margin: 5px;">      
                                        <div class="thumbnail">
                                          <a href="#"><img style="max-height: 400px; " src="<?php if($rowCurso['img']!=null){
                                          	echo "img/cursos/".$rowCurso['img'];}else{ echo "http://placehold.it/360x240";} ?>" alt="<?php echo $rowCurso['nome'] ?>" ></a>
                                        </div>
                                        <div class="caption-box" style="padding: 1px;" align="center">
                                          <h1 class="tm-section-title" style="color: white;"><strong><?php echo $rowCurso['nome']; ?></strong></h1>
                                          <h2 class="tm-section-title" style="color: white;"><?php if ($rowCurso['tipo']==1) {
                                          	echo "Curso semanal";
                                          }elseif ($rowCurso['tipo']==2) {
                                          	echo "Curso em módulos";
                                          }elseif ($rowCurso['tipo']==3){
                                          	echo "Evento";
                                          }else{
                                          	echo $rowCurso['subtitulo'];
                                          } ?></h2>
                                          <?php echo "<a href=\"#Curso".$contCursos."Section\" onclick=\"openCity(event, 'Curso".$contCursos."')\" style=\"font-size:1.1em; background-color: #2f2f2f; border-color: white;\"  class=\"btn btn-success\">Saiba mais</a>"; ?>
                                        </div>
                                      </li>
                            <?php 
                            if (($contCursos%3==0) && ($contCursos!=$totalCursos)) {
                                    echo "</ul></div>
                                    <div class=\"item\"><ul class=\"thumbnails\">";
                                }
                                if ($contCursos==$totalCursos) {
                                    echo "</ul>
                                     </div>";
                                }
                            $contCursos++;

                            }
                            ?>

      
          

          
        <!-- /Slide1 --> 





    </div><!-- /Wrapper for slides .carousel-inner -->



    <!-- Control box -->
     


  </div><!-- /#myCarousel -->
<div class="control-box">                            
      <a data-slide="prev" href="#myCarousel" class="carousel-control left" style="width: 60px; background-color: white; color: black; background: color;">‹</a>
      <a data-slide="next" href="#myCarousel" class="carousel-control right" style="width: 60px; background-color: white; color: black; background: color; !important">›</a>
    </div><!-- /.control-box -->  
                    
                        



            <?php
                $contCursos=1;
                $exib=$conn->prepare("SELECT * FROM tbCurso WHERE status=1");
                $exib->execute();
                while ($rowCurso=$exib->fetch()) {


            ?>
            <section id="welcome" style="margin-top: 30px;"></section>

            <section id="Curso<?php echo $contCursos ?>Section"> 
                <div id="Curso<?php echo $contCursos ?>" class="tabcontent container"> 
                	<div class="col-sm-3">
                	<div class="tm-sidebar">
                    <nav class="tm-main-nav">
                        <ul class="tm-main-nav-ul">
                            <li class="tm-nav-item"><a href="#welcome" class="tm-nav-item-link tm-button">
                                <i class="fa fa-clock-o tm-nav-fa"></i>O curso</a>
                            </li>
                            <li class="tm-nav-item"><a href="#gallery<?php echo $contCursos ?>" class="tm-nav-item-link tm-button">
                                <i class="fa fa-clock-o tm-nav-fa"></i>Conteúdo</a>
                            </li>
                            <?php
			                    $contData=0;
			                    $contHorario=0;
			                    $exibeHorarios=$conn->prepare("SELECT * FROM tbHhorarios WHERE id_curso = :pid");
			                    $exibeHorarios->bindValue(':pid',$rowCurso['id']);
                                $exibeHorarios->execute();
                                $contHorario=$exibeHorarios->rowCount();
                    			$exibeDatas=$conn->prepare("SELECT * FROM tbDatas WHERE id_curso = :pid");
                                $exibeDatas->bindValue(':pid',$rowCurso['id']);
                                $exibeDatas->execute();
                                $contData=$exibeDatas->rowCount();
                                if ($contData!=0 || $contHorario!=0) {
                                	?>
                            <li class="tm-nav-item"><a href="#services<?php echo $contCursos ?>" class="tm-nav-item-link tm-button">
                                <i class="fa fa-clock-o tm-nav-fa"></i>Datas</a>
                                
                            </li>
                            <?php
		                            } 
		                        ?>
		                     <?php

                    		$exibeInstrutores=$conn->prepare("SELECT id_instrutor FROM tbCurso WHERE id = :pid");
                                $exibeInstrutores->bindValue(':pid',$rowCurso['id']);
                                $exibeInstrutores->execute();
                                if (($continstrutor=$exibeInstrutores->rowCount())!=1) {
                                	
                                
                    	?>
                            <li class="tm-nav-item"><a href="#about<?php echo $contCursos ?>" class="tm-nav-item-link tm-button">
                                <i class="fa fa-clock-o tm-nav-fa"></i>Instrutor</a>
                            </li>
                            <?php
                        }
                        ?>
                            <li class="tm-nav-item"><a href="#contact<?php echo $contCursos ?>" class="tm-nav-item-link tm-button">
                                <i class="fa fa-clock-o tm-nav-fa"></i>O aluno</a>
                            </li>
                        </ul>
                    </nav>
                </div>
                </div>
                <div class="col-sm-9">
                    <div id="gallery<?php echo $contCursos ?>" class="tm-content-box">

                    <!-- Tab content -->
                         
                        <!-- <div class="tm-services-img-container"> -->
                            <?php
                                // $exibe=$conn->prepare("SELECT * FROM fotos WHERE id_curso = :pid");
                                // $exibe->bindValue(':pid',$rowCurso['id']);
                                // $exibe->execute();
                                // while ($rowFotos=$exibe->fetch()) {
                                //     echo "<img src=\"img/cursos/".$rowFotos['src']."\" alt=\"".$rowFotos['alt']."\" class=\"img-fluid tm-services-img\" style=\"padding: 10px;\">";
                                // }
                            ?>  
                        <!-- </div>  -->
                        <div class="tm-box-pad tm-bordered-box" style="height: 50px;">
                                <h1 class="tm-section-title" align="center" style="margin-top: -5px;font-size: 1.5em;"><b><?php if ($rowCurso['tipo']==1) {
                                          	echo "Curso semanal";
                                          }elseif ($rowCurso['tipo']==2) {
                                          	echo "Módulo";
                                          }elseif ($rowCurso['tipo']==3){
                                          	echo "Evento";
                                          }?></b></h1>
                            </div>    
                        <div class="tm-box-pad tm-services-description-container">
                        	
                            <h1 class="tm-section-title"><strong><?php echo $rowCurso['nome'] ?></strong></h1>
                            <h2 class="tm-section-title"><?php echo $rowCurso['subtitulo'] ?></h2>
                            <p class="tm-section-description"><?php echo $rowCurso['conteudo'] ?></p> 
    
                        </div>
                         
                       

                    </div>


                    <!-- Módulos -->
                    <?php
                    $contModulos=0;
                    $exibeHorarios=$conn->prepare("SELECT * FROM tbModulos WHERE id_curso = :pid");
                                $exibeHorarios->bindValue(':pid',$rowCurso['id']);
                                $exibeHorarios->execute();
                                $contHorario=$exibeHorarios->rowCount();
                                if ($contHorario!=0) {
                                    
                                

                    ?>
                    <div id="modulos<?php echo $contCursos ?>" class="tm-content-box tm-gray-bg tm-services">
                        <?php
                                
                                $exibeHorarios2=$conn->prepare("SELECT * FROM tbModulos WHERE id_curso = :pid ORDER BY numero ASC");
                                $exibeHorarios2->bindValue(':pid',$rowCurso['id']);
                                $exibeHorarios2->execute(); 
                                while ($row=$exibeHorarios2->fetch()) { 
                                    echo "<div class=\"tm-box-pad tm-bordered-box\">
                                            <h2 class=\"tm-section-title\" align=\"center\">Módulo ".$row['numero'].": ".$row['nome']." - ".$row['valor']."</h2><br><h5>Conteúdo: ".$row['conteudo']."</h5>
                                        </div><div class=\"tm-flex\" style=\"display: inline\">";

                                        $exibeHorarios3=$conn->prepare("SELECT * FROM tbDatas LEFT JOIN tbModulos ON (`tbDatas`.`id_curso`= :pid) WHERE `tbModulos`.`numero` = :pnumero");
                                        $exibeHorarios3->bindValue(':pid',$rowCurso['id']);
                                        $exibeHorarios3->bindValue(':pnumero',$row['numero']);
                                        $exibeHorarios3->execute(); 
                                        while ($row2=$exibeHorarios3->fetch()) { 
                                            echo "<p><span><i class=\"fa fa-calendar tm-nav-fa\" style=\"margin-left: 10px;\"></i></span><strong>".$row2['mes'].": </strong> ".$row2['dias']." - ".$row2['cidade']." - ".$row2['local']."</p><br>";
                                        }
                                     echo "</div>";  
                                    }
                                    echo "</div>";
                                    }  
                    ?>
                    <!-- Fim módulos -->








                    <?php
                    $contData=0;
                    $contHorario=0;
                    $exibeHorarios=$conn->prepare("SELECT * FROM tbHhorarios WHERE id_curso = :pid");
                                $exibeHorarios->bindValue(':pid',$rowCurso['id']);
                                $exibeHorarios->execute();
                                $contHorario=$exibeHorarios->rowCount();
                    	$exibeDatas=$conn->prepare("SELECT * FROM tbDatas WHERE id_curso = :pid");
                                $exibeDatas->bindValue(':pid',$rowCurso['id']);
                                $exibeDatas->execute();
                                $contData=$exibeDatas->rowCount();
                                if (($contData!=0 || $contHorario!=0)&&$rowCurso['tipo']!=2) {
                                	
                                

                    ?>
                    <div id="services<?php echo $contCursos ?>" class="tm-content-box tm-gray-bg tm-services">

                        <div class="tm-box-pad tm-bordered-box">
                            <h2 class="tm-section-title" align="center">Datas e Horários</h2>
                        </div>
                        <div class="tm-flex">
                        	<?php
                        		if ($contData!=0) {
                        			
                        		
                        	?>
                            <div class="tm-purple-bg tm-box-pad tm-bordered-box tm-no-border-top">
                                <h2 class="tm-section-title">Datas</h2>
                                <p>
                                <?php

                                $exibeDatas=$conn->prepare("SELECT * FROM tbDatas WHERE id_curso = :pid");
                                $exibeDatas->bindValue(':pid',$rowCurso['id']);
                                $exibeDatas->execute();
                                while ($rowDatas=$exibeDatas->fetch()) {
                                    echo "<p><span><i class=\"fa fa-calendar tm-nav-fa\"></i></span><strong>".$rowDatas['mes'].": </strong> ".$rowDatas['dias']."</p>
                                </p>";
                                }
                                ?>

                            </div>

                            <?php
                        		}
                            ?>
                            <?php
                        		if ($contHorario!=0) {
                        			
                        		
                        	?>
                            <div class="tm-gray-bg tm-box-pad tm-bordered-box tm-no-border-top">
                                <h2 class="tm-section-title">Horários</h2>

                                <?php

                                $exibeHorarios=$conn->prepare("SELECT * FROM tbHhorarios WHERE id_curso = :pid");
                                $exibeHorarios->bindValue(':pid',$rowCurso['id']);
                                $exibeHorarios->execute();
                                while ($rowHorarios=$exibeHorarios->fetch()) {
                                    echo "<p><span><i class=\"fa fa-clock-o tm-nav-fa\"></i></span><strong>".$rowHorarios['dia'].": </strong>".$rowHorarios['hora']."</p>";
                                }
                                ?>

                            </div>   
                            <?php
                            	}
                            ?> 
                        </div>                                             
                        
                    </div>
                    <?php
						}	
                    ?>

                    <!-- slider -->
                    <div id="about<?php echo $contCursos ?>" class="tm-content-box">
                    	<?php

                    		$exibeInstrutores=$conn->prepare("SELECT id_instrutor FROM tbCurso WHERE id = :pid");
                                $exibeInstrutores->bindValue(':pid',$rowCurso['id']);
                                $exibeInstrutores->execute();
                                if (($continstrutor=$exibeInstrutores->rowCount())!=1) {
                                	
                                
                    	?>
                        <div class="tm-box-pad tm-bordered-box">
                        	<?php

                                $exibeInstrutores=$conn->prepare("SELECT id_instrutor FROM tbCurso WHERE id = :pid");
                                $exibeInstrutores->bindValue(':pid',$rowCurso['id']);
                                $exibeInstrutores->execute();
                                while ($rowInstrutor=$exibeInstrutores->fetch()) {
                                	$exibeInstrutores2=$conn->prepare("SELECT * FROM tbInstrutores WHERE id = :pid");
	                                $exibeInstrutores2->bindValue(':pid',$rowInstrutor['id_instrutor']);
	                                $exibeInstrutores2->execute();
	                                while ($rowInstrutor2=$exibeInstrutores2->fetch()) {
	                                	echo "<h2 class=\"tm-section-title\">".$rowInstrutor2['nome']."</h2>
                            <p>".$rowInstrutor2['bio']."</p>
                            <a href=\"".$rowInstrutor2['link']."\" class=\"tm-button tm-button-normal\">Saiba mais</a>";
	                                }
                                }
                            ?>
                            
                        </div>
                        <?php
                    		}
                        ?>
                        <div class="tm-box-pad tm-bordered-box">
                            <h2 class="tm-section-title">* Nossos cursos são exclusivos para médicos ou dentistas *</h2>
                            
                        </div>


                        <?php
                        	$contBiblio=0;
                        	$exibeLivros=$conn->prepare("SELECT * FROM tbBibliografia WHERE id_curso = :pid");
                            $exibeLivros->bindValue(':pid',$rowCurso['id']);
                            $exibeLivros->execute();
                            $contBiblio=$exibeLivros->rowCount();
                            if ($contBiblio > 0 || $rowCurso['valor'] != null) {
                            
                            
                        ?>
                        <div class="tm-flex">
                        	<?php
                        	if ($rowCurso['valor']!=null) {
                        		?>
                        	
                            <div class="tm-purple-bg tm-box-pad tm-bordered-box tm-no-border-top">
                                <h2 class="tm-section-title">Investimento</h2>
                                <h3><?php echo $rowCurso['valor'];?></h3>
                            </div>
                            <?php
                            	}
                            	if ($contBiblio > 0) {
                            		
                            	
                            ?>
                            <div class="tm-gray-bg tm-box-pad tm-bordered-box tm-no-border-top">
                                <h2 class="tm-section-title">Bibliografia e Material Didático</h2>
                                <?php

                                $exibeLivros=$conn->prepare("SELECT * FROM tbBibliografia WHERE id_curso = :pid");
                                $exibeLivros->bindValue(':pid',$rowCurso['id']);
                                $exibeLivros->execute();
                                while ($rowLivros=$exibeLivros->fetch()) {
                                    echo "<p><span><i class=\"fa fa-book tm-nav-fa\"></i></span><strong>".$rowLivros['nome']." </strong> ".$rowLivros['autor']."</p>";
                                }
                                ?>
                                
                            </div>
                            <?php
                            }
                            ?>    
                        </div> 
                        <?php
                        	}
                        ?>                       
                    </div>

                    <section id="contact<?php echo $rowCurso['id'] ?>" class="tm-content-box">

                        <div class="tm-flex">
                        	
                            <div class="tm-contact-left-half tm-gray-bg">
                                <div class="tm-contact-inner-pad">
                                    <h2 class="tm-section-title">Dados do aluno:</h2>
                                    <form action="#cadastro" method="post" class="contact-form">
                                        <input type="hidden" name="id_curso" value="<?php echo $rowCurso['id'] ?>">
                                        <div class="form-group">
                                            <input type="email" id="contact_email" name="email" class="form-control" placeholder="E-mail"  required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="password" id="contact_password" name="senha" class="form-control" placeholder="Senha"  required/>
                                        </div>
                                        <a href="" style="font-size: 0.6em">Esqueci a senha</a><br><br>
                                        <!-- <?php
            //                             	$datas_curso=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso=:pid ORDER BY mes ASC');
												// $datas_curso->bindValue(':pid',$rowCurso['id']);
												// $datas_curso->execute();
												// if ($contdatasa=$datas_curso->rowCount()!=0) {
													
												
                                        ?>
                                        <div class="form-group">
	                                        <select name="id_data" required="required">
											<?php
												// $datas_curso=$conn->prepare('SELECT * FROM tbDatas WHERE id_curso=:pid ORDER BY mes ASC');
												// $datas_curso->bindValue(':pid',$rowCurso['id']);
												// $datas_curso->execute();
												// while ($curs=$datas_curso->fetch()) {
												// 	echo "<option value=\"".$curs['id']."\">".$curs['mes']." - ".$curs['dias']."</option>";
												// }
											?>
											</select>
										</div>
										<?php
											// }
										?> -->
                                        
                                        <button type="submit" class="btn btn-primary pull-xs-left tm-button tm-button-normal" name="login">Prosseguir</button>
                                        <br><br>
                                        </form>
                                    </div>
                                    	<div class="form-group">
                                        <button class="tablinks btn btn-primary pull-xs-left tm-button tm-button-normal" onclick="openMenu(event, 'registro<?php echo $rowCurso['id']; ?>')" style="margin-top: 20px;  margin-left: 25px;">Registre-se</button>
                                        </div>
                                   <br>
                                   <br>
                                   <br>
                                   <br>

                                    <section id="cadastro">

                                    	<div class="tabcontent2" id="registro<?php echo $rowCurso['id']; ?>">
                                    			<form action="#registro" method="post" class="contact-form">
                                    			<div class="form-group">
                                            <input type="email" id="contact_email" name="email" class="form-control" placeholder="E-mail"  required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="password" id="contact_password" name="senha" class="form-control" placeholder="Senha"  required/>
                                        </div>
                                    			<div class="form-group">
                                            <input type="text" id="contact_name" name="nome" class="form-control" placeholder="Nome" required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="phone" id="contact_phone" name="telefone" class="form-control" placeholder="Telefone" required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="text" id="contact_address" name="endereco" class="form-control" placeholder="Endereço" required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="text" id="contact_crm" name="crm" class="form-control" placeholder="CRM/CRO" required/>
                                        </div>
                                        <div class="form-group">
                                            <input type="number" id="contact_cpf" name="cpf" class="form-control" placeholder="CPF" required/>
                                        </div>
                                        <button type="submit" class="btn btn-primary pull-xs-left tm-button tm-button-normal" name="registrando">Prosseguir</button>
                                    	</form>
                                    	</div>
                                        



                                    	<?php
                                    		if (isset($_POST['login'])) {
                                    			$email=$_POST['email'];
                                    			$senha=$_POST['senha'];
                                    			$id_data=$_POST['id_data'];
                                                $id_curso=$_POST['id_curso'];
                                    			$ver_login=$conn->prepare('SELECT * FROM tbUsuario WHERE email=:pusu AND senha=:psenha;');
												$ver_login->bindValue(':pusu',$email);
												$ver_login->bindValue(':psenha',$senha);
												$ver_login->execute();
												if($ver_login->rowCount()!=0){
													while ($inst=$ver_login->fetch()) {
														// $grava3=$conn->prepare('INSERT INTO tbAluno (usuario_id, id_curso, datainscricao) VALUES (:pid_aluno, :pid_curso, :pid_data)');
													 //    $grava3->bindValue(':pid_aluno',$inst['id']);
													 //    $grava3->bindValue(':pid_curso',$rowCurso['id']);
													 //    $grava3->bindValue(':pid_data',$data_hoje);
													 //    $grava3->execute();
													    // echo "Inscrição realizada com sucesso.<br> Para confirmá-la efetue o depósito do valor correspondente ao curso na conta:<br> CC: 2214<br>AG: 0555<br>Banco: 014<br>Titular: The Other Song Brazil<br><br>Enviar comprovante para: theothersong@theothersong.com.br<br><br>Obrigado!";
													    // echo "<meta http-equiv=\"refresh\" target=\"_blank\" content=0;url=\"".$rowCurso['link_pagamento']."\">";
													    echo "<meta http-equiv=\"refresh\" content=0;url=\"confirma.php?a=".$inst['id']."&c=".$id_curso."\">";
													 //    echo"<script type='text/javascript'>";

														// echo "alert('Inscrição realizada com sucesso.\n Para confirmá-la efetue o depósito do valor correspondente ao curso na conta:\n CC: 2214\nAG: 0555\nBanco: 014\nTitular: The Other Song Brazil\n\nEnviar comprovante para: theothersong@theothersong.com.br\n\nObrigado!');";

														// echo "</script>";
													}
												}else{
													   echo"<script type='text/javascript'>";

														echo "alert('Usuário ou senha incorretos. Selecione o curso e tente novamente');";

														echo "</script>";
												}
                                    		}

                                    	?>
                                    	<section id="registro">
                                    		<?php
                                    			if (isset($_POST['registrando'])) {
                                    				// echo "<meta http-equiv=\"refresh\" target=\"_blank\" content=0;url=\"http://clinicasimilia.com.br/usuario/registrar\">";
                                                    echo "<meta http-equiv=\"refresh\" content=0;url=\"confirma.php?c=".$rowCurso['id']."\">";

                                    			}
                                    		?>
                                    	</section>




                                    </section> 
                                </div>
                                
                                    
                                    	<?php 
                                            if (empty($rowCurso['local'])) {
                                                echo "<div class=\"tm-contact-right-half tm-purple-bg\">
                                <div class=\"tm-address-box\"><address>
                                    <h2 class=\"tm-section-title\">Local do curso:</h2>";
                                               echo $rowCurso['local'];
                                               echo "</div></address></div> ";
                                            }
                                    		
                                    	?>
                                    	<!-- <?php 
                                    // $extensao = explode('-', $rowCurso['local']);
                                    // foreach ($extensao as $key) {
                                    // 	echo $key;
                                    // 	echo "<br>";
                                    // }
                                    // unset($key);
                                    ?> -->
                                        
                                                               
                                <!-- <div align="center"><div class="mapouter"><div class="gmap_canvas"><iframe width="424" height="339" id="gmap_canvas" src="https://www.google.com.br/maps?q=rua+pra%C3%A7a+os%C3%B3rio,+115&um=1&ie=UTF-8&sa=X&ved=0ahUKEwjWqKPj5JDdAhVMHZAKHff-BtIQ_AUICigB&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://www.pureblack.de"></a></div><style>.mapouter{text-align:right;height:339px;width:424px;}.gmap_canvas {overflow:hidden;background:none!important;height:339px;width:424px;}</style></div></div> -->
                            
                                                               
                            </div>






                            
                        </div>
                        
                    </section> 
                    </div> 
                </div>
            </section>

            <?php
            $contCursos++;
                } 

            ?>





                <!-- Curso 2 -->

                <section id="Curso2Section">
                    <div id="Curso2" class="tabcontent">
                        

                    </div>
                </section>















                    <footer class="tm-footer">
                        <p class="text-xs-center">Copyright &copy; 2018 -<a href="http://www.clinicasimilia.com.br" target="_parent"> Clinica Similia</a></p>
                    </footer>

                </div>
            </div>             
        </div>
        
        <!-- load JS files -->
        <script
  src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script
  src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<script type="text/javascript">
        <script src="js/jquery-1.11.3.min.js"></script>
        <script src="https://www.atlasestateagents.co.uk/javascript/tether.min.js"></script>
        <script src="js/jquery.magnific-popup.min.js"></script>
        <script src="js/jquery.singlePageNav.min.js"></script>
        <script>  

        var map = '';
        var center;

        function initialize() {
            var mapOptions = {
                zoom: 16,
                center: new google.maps.LatLng(-25.4464995, -49.2935628),
                scrollwheel: false
            };
        
            map = new google.maps.Map(document.getElementById('google-map'),  mapOptions);

            google.maps.event.addDomListener(map, 'idle', function() {
              calculateCenter();
            });
        
            google.maps.event.addDomListener(window, 'resize', function() {
              map.setCenter(center);
            });
        }

        function calculateCenter() {
            center = map.getCenter();
        }

        function loadGoogleMap(){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' + 'callback=initialize';
            document.body.appendChild(script);
        } 

        function setNavbar() {
            if ($(document).scrollTop() > 800) {
                $('.tm-sidebar').addClass('sticky');
            } else {
                $('.tm-sidebar').removeClass('sticky');
            }
        }                   
    
        $(document).ready(function(){
            
            // Single page nav
            $('.tm-main-nav').singlePageNav({
                'currentClass' : "active",
                offset : 20
            });

            // Detect window scroll and change navbar
            setNavbar();
            
            $(window).scroll(function() {
              setNavbar();
            });

            // Magnific pop up
            $('.tm-gallery').magnificPopup({
              delegate: 'a', // child items selector, by clicking on it popup will open
              type: 'image',
              gallery: {enabled:true}
              // other options
            });

            // Google Map
            loadGoogleMap();            
        });
    
        </script>   

        <script type="text/javascript">
            function openCity(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
        </script>          
<script type="text/javascript">
	 var bg = $('#bg');
 $(window).scroll(function() {
   var x = $(this).scrollTop();
   bg.css('background-position', '0% ');
 });
</script>

<script type="text/javascript">
  
// Carousel Auto-Cycle
  $(document).ready(function() {
    $('.carousel').carousel({
      interval: 6000
    })
  });


</script>

<script>
function openMenu(evt, cityName) {
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
    </body>
    </html>