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

import com.hortitech.entities.CamaraFria;
import com.hortitech.services.CamaraFriaServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/camaraFria")
@CrossOrigin("*")
public class CamaraFriaController {

	@Autowired 
	private CamaraFriaServices service;

	@GetMapping
	public ResponseEntity <List<CamaraFria>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CamaraFria> buscar(@PathVariable Long id) {
		Optional <CamaraFria> camaraFria = service.buscarPorId(id);
		
		if(camaraFria != null) {
			return ResponseEntity.ok(camaraFria.get());
		}
		
		return ResponseEntity.notFound().build();
	}

	@PostMapping
	public ResponseEntity <CamaraFria> criar(@Valid @RequestBody CamaraFria camaraFria) {
		CamaraFria novoCamaraFria = service.salvar(camaraFria);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoCamaraFria);
	}

	@PutMapping("/{id}")
	public ResponseEntity <CamaraFria> atualizar(@PathVariable Long id, @Valid @RequestBody CamaraFria camaraFria) {
		CamaraFria camaraFriaAtualizado = service.atualizar(id, camaraFria);
		
		if (camaraFriaAtualizado != null) {
			return ResponseEntity.ok(camaraFriaAtualizado);
		}
		
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity <Object> excluir(@PathVariable Long id) {
		Optional<CamaraFria> camaraFria = service.buscarPorId(id);
		
		if(camaraFria.isPresent()) {
			service.deletar(id);
			
			return ResponseEntity.status(HttpStatus.OK).body("Sucesso: A Câmara Fria Foi Excluido Permanentemente!");
		}
		
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: O Câmara Fria Com A ID:" + id + " Não Foi Encontrado.");
		
	}
}

