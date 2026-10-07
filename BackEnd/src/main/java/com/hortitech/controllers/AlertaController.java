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

import com.hortitech.entities.Alerta;
import com.hortitech.services.AlertaServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alerta")
@CrossOrigin("*")
public class AlertaController {

	@Autowired 
	private AlertaServices service;

	@GetMapping
	public ResponseEntity <List<Alerta>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Alerta> buscar(@PathVariable Long id) {
		Optional <Alerta> alerta = service.buscarPorId(id);
		
		if(alerta != null) {
			return ResponseEntity.ok(alerta.get());
		}
		
		return ResponseEntity.notFound().build();
	}

	@PostMapping
	public ResponseEntity <Alerta> criar(@Valid @RequestBody Alerta alerta) {
		Alerta novoAlerta= service.salvar(alerta);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoAlerta);
	}

	@PutMapping("/{id}")
	public ResponseEntity <Alerta> atualizar(@PathVariable Long id, @Valid @RequestBody Alerta alerta) {
		Alerta alertaAtualizado = service.atualizar(id, alerta);
		
		if (alertaAtualizado != null) {
			return ResponseEntity.ok(alertaAtualizado);
		}
		
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity <Object> excluir(@PathVariable Long id) {
		Optional<Alerta> alerta = service.buscarPorId(id);
		
		if(alerta.isPresent()) {
			service.deletar(id);
			
			return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O Alerta Foi Excluido Permanentemente!");
		}
		
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: Não Foi Possível Localizar O Alerta");
		
	}

}
