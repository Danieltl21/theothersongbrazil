function removerCurso(id, nome){
	$.bsAlert.alertTitle = "Um erro ocorreu!";
 	$.bsAlert.confirmTitle = "Você tem certeza?";
 	$.bsAlert.sureDisplay = "Confirmar";
 	$.bsAlert.closeDisplay = "Cancelar";

 	$.bsAlert.confirm('Deseja mesmo remover o curso "' + nome + '"? <br> Todos os dados relacionados a ele, como os pagamentos e presenças, serão apagados PERMANENTEMENTE.',function(){
  		$.post('removerCurso.php', {
  			id: id
  		}, function(data){
  			console.log(data);
            if(!data){
            	$.bsAlert.alert("Atualize a página e informe ao suporte técnico.");
            } else {
            	$("#" + id).hide(1000);
            }
  		}).fail(function(){
  			$.bsAlert.alert("Atualize a página e informe ao suporte técnico.");
  		});
	});

}