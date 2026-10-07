package com.hortitech.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hortitech.entities.RegistroTermico;
import com.hortitech.services.RegistroTermicoServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registroTermico")
@CrossOrigin("*")
public class RegistroTermicoController {

	
	@Autowired 
	private RegistroTermicoServices service;

	@GetMapping
	public ResponseEntity <List<RegistroTermico>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<RegistroTermico> buscar(@PathVariable Long id) {
		Optional <RegistroTermico> registroTermico = service.buscarPorId(id);
		
		if(registroTermico != null) {
			return ResponseEntity.ok(registroTermico.get());
		}
		
		return ResponseEntity.notFound().build();
	}

	@PostMapping
	public ResponseEntity <RegistroTermico> criar(@Valid @RequestBody RegistroTermico registroTermico) {
		RegistroTermico novoRegistroTermico = service.salvar(registroTermico);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoRegistroTermico);
	}

	@PutMapping("/{id}")
	public ResponseEntity <RegistroTermico> atualizar(@PathVariable Long id, @Valid @RequestBody RegistroTermico registroTermico) {
		RegistroTermico registroTermicoAtualizado = service.atualizar(id, registroTermico);
		
		if (registroTermicoAtualizado != null) {
			return ResponseEntity.ok(registroTermicoAtualizado);
		}
		
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity <Object> excluir(@PathVariable Long id) {
		Optional<RegistroTermico> registroTermico = service.buscarPorId(id);
		
		if(registroTermico.isPresent()) {
			service.deletar(id);
			
			return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O Registro Térmico Da Câmara Fria Foi Excluido Permanentemente!");
		}
		
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: O Registro Térmico Da Câmar Fria Com A ID:" + id + " Não Foi Encontrado.");
		
	}

}
