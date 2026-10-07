package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hortitech.entities.Colaboradores;
import com.hortitech.entities.Usuario;
import com.hortitech.repositories.ColaboradoresRepository;

@Service
public class ColaboradoresServices {

	@Autowired
	private ColaboradoresRepository repository;
	
	@Autowired
	private UsuarioServices usuarioService; 

	public List<Colaboradores> listarTodos() {
		return repository.findAll();
	}

	public Optional <Colaboradores> buscarPorId(Long id) {
		return repository.findById(id);
	}

	public Colaboradores salvar(Colaboradores colaboradores) {
		Usuario usuarioNovo = new Usuario();
		
	
		usuarioNovo.setEmail(colaboradores.getEmail());
		usuarioNovo.setSenha(colaboradores.getSenha());
		usuarioNovo.setTipo(colaboradores.getTipo());
		
		usuarioService.salvar(usuarioNovo);
		
		return repository.save(colaboradores);
	}

	public Colaboradores atualizar(Long id, Colaboradores colaboradoresAlterado) {
		Optional <Colaboradores> existente = buscarPorId(id);
		
		if (existente.isPresent()) {
			
			Colaboradores atualizado = existente.get();
			
			atualizado.setNome(colaboradoresAlterado.getNome());
			atualizado.setCpf(colaboradoresAlterado.getCpf());
			atualizado.setEmail(colaboradoresAlterado.getEmail());
			atualizado.setSenha(colaboradoresAlterado.getSenha());
			atualizado.setTipo(colaboradoresAlterado.getTipo());
			
			return repository.save(atualizado);
		}
		
		return null;
	}

	public void deletar(Long id) {
		repository.deleteById(id);
	}
}