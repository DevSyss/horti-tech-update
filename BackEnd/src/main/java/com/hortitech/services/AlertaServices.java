package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hortitech.entities.Alerta;
import com.hortitech.repositories.AlertaRepository;

@Service
public class AlertaServices {
	
	@Autowired
	private AlertaRepository repository;

	public List<Alerta> listarTodos() {
		return repository.findAll();
	}

	public Optional <Alerta> buscarPorId(Long id) {
		return repository.findById(id);
		
	}

	public Alerta salvar(Alerta alerta) {
		return repository.save(alerta);
	}

	public Alerta atualizar(Long id, Alerta alertaAlterado) {
		Optional <Alerta> existente = buscarPorId(id);
		
		if (existente.isPresent()) {
			
			Alerta atualizado = existente.get();
			
		atualizado.setTipo(alertaAlterado.getTipo());
		atualizado.setMensagem(alertaAlterado.getMensagem());
		atualizado.setDataHora(alertaAlterado.getDataHora());
		atualizado.setStatus(alertaAlterado.isStatus());
		return repository.save(atualizado);
	}
	
	return null;
}

	public void deletar(Long id) {
		repository.deleteById(id);
	
}

	


}
