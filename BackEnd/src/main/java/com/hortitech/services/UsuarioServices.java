package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.hortitech.entities.Usuario;
import com.hortitech.repositories.UsuarioRepository;

import jakarta.validation.Valid;

@Service
public class UsuarioServices {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private BCryptPasswordEncoder password;

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public Usuario salvar(Usuario usuario) {

        usuario.setSenha(password.encode(usuario.getSenha()));

        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuarioAlterado) {

        Optional<Usuario> existente = buscarPorId(id);

        if (existente.isPresent()) {

            Usuario atualizado = existente.get();

            atualizado.setEmail(usuarioAlterado.getEmail());
            atualizado.setTipo(usuarioAlterado.getTipo());

            if (usuarioAlterado.getSenha() != null &&
                !usuarioAlterado.getSenha().isEmpty()) {

                atualizado.setSenha(
                    password.encode(usuarioAlterado.getSenha())
                );
            }

            return repository.save(atualizado);
        }

        return null;
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public Usuario login(String email, String senha) {

        Optional<Usuario> usuario = repository.findByEmail(email);

        if (usuario.isPresent()) {

            Usuario usuarioLogado = usuario.get();

            if (password.matches(senha, usuarioLogado.getSenha())) {
                return usuarioLogado;
            }
        }

        return null;
    }

	public Usuario salvarUsuario(@Valid Usuario usuario) {
		return null;
	}
	
	
	
}