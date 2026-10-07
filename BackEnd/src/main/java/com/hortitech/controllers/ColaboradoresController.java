package com.hortitech.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hortitech.entities.Colaboradores;
import com.hortitech.services.ColaboradoresServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/colaboradores")
public class ColaboradoresController {

	@Autowired 
	private ColaboradoresServices service;

	@GetMapping
	public ResponseEntity <List<Colaboradores>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Colaboradores> buscar(@PathVariable Long id) {
		Optional <Colaboradores> colaboradores = service.buscarPorId(id);
		
		if(colaboradores != null) {
			return ResponseEntity.ok(colaboradores.get());
		}
		
		return ResponseEntity.notFound().build();
	}

	@PostMapping
	public ResponseEntity <Colaboradores> criar(@Valid @RequestBody Colaboradores colaboradores) {
		Colaboradores novoColaboradores = service.salvar(colaboradores);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoColaboradores);
	}

	@PutMapping("/{id}")
	public ResponseEntity <Colaboradores> atualizar(@PathVariable Long id, @Valid @RequestBody Colaboradores colaboradores) {
		Colaboradores colaboradoresAlterado = service.atualizar(id, colaboradores);
		
		if (colaboradoresAlterado != null) {
			return ResponseEntity.ok(colaboradoresAlterado);
		}
		
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity <Object> excluir(@PathVariable Long id) {
		Optional<Colaboradores> colaboradores = service.buscarPorId(id);
		
		if(colaboradores.isPresent()) {
			service.deletar(id);
			
			return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O Colaborador Foi Excluido Permanentemente!");
		}
		
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: O Colaborador Com ID" + id + "Não Foi Encontrado.");
		
	}

}

