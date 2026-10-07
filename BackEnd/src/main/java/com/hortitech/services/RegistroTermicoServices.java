package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hortitech.entities.RegistroTermico;
import com.hortitech.repositories.RegistroTermicoRepository;

@Service
public class RegistroTermicoServices {

			@Autowired
			private RegistroTermicoRepository repository;

			public List<RegistroTermico> listarTodos() {
				return repository.findAll();
			}

			public Optional <RegistroTermico> buscarPorId(Long id) {
				return repository.findById(id);
				
			}

			public RegistroTermico salvar(RegistroTermico registroTermico) {
				return repository.save(registroTermico);
			}

			public RegistroTermico atualizar(Long id, RegistroTermico registroTermicoAlterado) {
				Optional <RegistroTermico> existente = buscarPorId(id);
				
				if (existente.isPresent()) {
					
					RegistroTermico atualizado = existente.get();
					
				atualizado.setTemperatura(registroTermicoAlterado.getTemperatura());
				atualizado.setUmidade(registroTermicoAlterado.getUmidade());
				atualizado.setDataHora(registroTermicoAlterado.getDataHora());
				return repository.save(atualizado);
			}
			
			return null;
		}

			public void deletar(Long id) {
				repository.deleteById(id);
				
			
		}
}