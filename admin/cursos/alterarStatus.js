function alterarStatus(id, status){
	status = Number(status);
	$.post("alterarStatus.php", {
		id: id,
		status: status
	}, function(){
		$("#" + id).find(".td-status").fadeOut(function() {$(this).text((status ? "Desativado" : "Ativado")).addClass((status ? "desativado" : "ativado")).removeClass((status ? "ativado" : "desativado")).fadeIn();});
		$("#" + id).find(".td-buttons button:nth-child(2)").text((status ? "ativar" : "desativar")).attr("onclick","alterarStatus(" + id + "," + !status + ")");
	})
}