package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hortitech.entities.CamaraFria;
import com.hortitech.repositories.CamaraFriaRepository;

@Service
public class CamaraFriaServices {

	@Autowired
	private CamaraFriaRepository repository;

	public List<CamaraFria> listarTodos() {
		return repository.findAll();
	}

	public Optional <CamaraFria> buscarPorId(Long id) {
		return repository.findById(id);
		
	}

	public CamaraFria salvar(CamaraFria camaraFria) {
		return repository.save(camaraFria);
	}

	public CamaraFria atualizar(Long id, CamaraFria camaraFriaAlterado) {
		Optional <CamaraFria> existente = buscarPorId(id);
		
		if (existente.isPresent()) {
			
			CamaraFria atualizado = existente.get();
			
		atualizado.setLocal(camaraFriaAlterado.getLocal());
		atualizado.setTemperaturaMinima(camaraFriaAlterado.getTemperaturaMinima());
		atualizado.setTemperaturaMaxima(camaraFriaAlterado.getTemperaturaMaxima());
		atualizado.setNome(camaraFriaAlterado.getNome());
		atualizado.setSensor(camaraFriaAlterado.getSensor());
		return repository.save(atualizado);
	}
	
	return null;
}

	public void deletar(Long id) {
		repository.deleteById(id);
	
	}
}
