
package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hortitech.entities.Usuario;
import com.hortitech.repositories.UsuarioRepository;

@Service
public class UsuarioServices {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServices(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public Usuario salvarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException(
                "Os dados do usuário são obrigatórios."
            );
        }

        if (usuario.getEmail() == null
                || usuario.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                "O e-mail é obrigatório."
            );
        }

        if (usuario.getSenha() == null
                || usuario.getSenha().isBlank()) {
            throw new IllegalArgumentException(
                "A senha é obrigatória."
            );
        }

        Optional<Usuario> existente =
                usuarioRepository.findByEmail(usuario.getEmail());

        if (existente.isPresent()) {
            throw new IllegalArgumentException(
                "Já existe um usuário cadastrado com esse e-mail."
            );
        }

        usuario.setSenha(
            passwordEncoder.encode(usuario.getSenha())
        );

        return usuarioRepository.save(usuario);
    }

    public Usuario login(String email, String senha) {
        if (email == null || senha == null) {
            return null;
        }

        Optional<Usuario> resultado =
                usuarioRepository.findByEmail(email);

        if (resultado.isEmpty()) {
            return null;
        }

        Usuario usuario = resultado.get();

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            return null;
        }

        return usuario;
    }

    @Transactional
    public Usuario atualizar(Long id, Usuario dados) {
        Optional<Usuario> resultado =
                usuarioRepository.findById(id);

        if (resultado.isEmpty()) {
            return null;
        }

        Usuario usuario = resultado.get();

        if (dados.getEmail() != null
                && !dados.getEmail().isBlank()) {

            Optional<Usuario> existente =
                    usuarioRepository.findByEmail(dados.getEmail());

            if (existente.isPresent()
                    && !existente.get().getId().equals(id)) {
                throw new IllegalArgumentException(
                    "Esse e-mail já está cadastrado."
                );
            }

            usuario.setEmail(dados.getEmail());
        }

        if (dados.getSenha() != null
                && !dados.getSenha().isBlank()) {
            usuario.setSenha(
                passwordEncoder.encode(dados.getSenha())
            );
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deletar(Long id) {
        usuarioRepository.deleteById(id);
    }

    public boolean validarLogin(String email, String senha) {
        return login(email, senha) != null;
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}
