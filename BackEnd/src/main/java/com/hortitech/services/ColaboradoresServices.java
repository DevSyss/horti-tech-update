
package com.hortitech.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hortitech.entities.Colaboradores;
import com.hortitech.entities.Usuario;
import com.hortitech.repositories.ColaboradoresRepository;

@Service
public class ColaboradoresServices {

    @Autowired
    private ColaboradoresRepository repository;

    @Autowired
    private UsuarioServices usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Colaboradores> listarTodos() {
        return repository.findAll();
    }

    public Optional<Colaboradores> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Colaboradores salvar(Colaboradores colaboradores) {

        if (colaboradores == null) {
            throw new IllegalArgumentException(
                "Os dados do colaborador são obrigatórios."
            );
        }

        if (colaboradores.getEmail() == null
                || colaboradores.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                "O e-mail do colaborador é obrigatório."
            );
        }

        if (colaboradores.getSenha() == null
                || colaboradores.getSenha().isBlank()) {
            throw new IllegalArgumentException(
                "A senha do colaborador é obrigatória."
            );
        }

        Usuario usuarioNovo = new Usuario();
        usuarioNovo.setEmail(colaboradores.getEmail());
        usuarioNovo.setSenha(colaboradores.getSenha());

        // Cadastra a conta de acesso usando o serviço de usuários.
        usuarioService.salvarUsuario(usuarioNovo);

        // Criptografa a senha também no registro do colaborador.
        colaboradores.setSenha(
            passwordEncoder.encode(colaboradores.getSenha())
        );

        return repository.save(colaboradores);
    }

    @Transactional
    public Colaboradores atualizar(
            Long id,
            Colaboradores colaboradoresAlterado) {

        Optional<Colaboradores> existente = buscarPorId(id);

        if (existente.isEmpty()) {
            return null;
        }

        Colaboradores atualizado = existente.get();

        atualizado.setNome(colaboradoresAlterado.getNome());
        atualizado.setCpf(colaboradoresAlterado.getCpf());

        if (colaboradoresAlterado.getEmail() != null
                && !colaboradoresAlterado.getEmail().isBlank()) {
            atualizado.setEmail(colaboradoresAlterado.getEmail());
        }

        if (colaboradoresAlterado.getSenha() != null
                && !colaboradoresAlterado.getSenha().isBlank()) {
            atualizado.setSenha(
                passwordEncoder.encode(
                    colaboradoresAlterado.getSenha()
                )
            );
        }

        return repository.save(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
