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

import com.hortitech.entities.Usuario;
import com.hortitech.services.UsuarioServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

	@Autowired
	private UsuarioServices service;

	@GetMapping
	public ResponseEntity<List<Usuario>> listar() {
		return ResponseEntity.ok(service.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Usuario> buscar(@PathVariable Long id) {
		Optional<Usuario> usuario = service.buscarPorId(id);
		if (usuario.isPresent()) {
			return ResponseEntity.ok(usuario.get());
		}
		return ResponseEntity.notFound().build();
	}

	@PostMapping("/cadastro")
	public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody Usuario usuario) {
	    Usuario usuarioSalvo = service.salvarUsuario(usuario);
	    return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSalvo);
	}

	@PostMapping("/login")
	public ResponseEntity<Usuario> login(@RequestBody Usuario usuariologin) {

		Usuario usuario = service.login(usuariologin.getEmail(), usuariologin.getSenha());

		return ResponseEntity.ok(usuario);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @Valid @RequestBody Usuario usuario) {
		Usuario usuarioAtualizado = service.atualizar(id, usuario);
		if (usuarioAtualizado != null) {
			return ResponseEntity.ok(usuarioAtualizado);
		}
		return ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Object> excluir(@PathVariable Long id) {
		Optional<Usuario> usuario = service.buscarPorId(id);

		if (usuario.isPresent()) {
			service.deletar(id);

			return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O Usuario Foi Excluido Com Sucesso");

		}
		return null;

	}
	
	
}
