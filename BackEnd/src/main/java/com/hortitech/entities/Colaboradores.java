package com.hortitech.entities;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_colaboradores")
public class Colaboradores {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	

	@Pattern(regexp="^[\\p{L}]+( [\\p{L}+)*$", message = "O Nome Do Aluno Deve Conter Apenas Letras E Espaços")
    @NotBlank(message = "O Nome É Obrigatório.")
    private String nome;
	
	@NotBlank(message = "O CPF É Obrigatótio.")
	@CPF(message = "CPF Inválido")
	@Column(nullable = false, unique = true, length = 14)
	private String cpf;

    @Email(message = "E-mail inválido.")
    @Size(max = 120, message = "O E-mail Deve Ter No Máximo 120 Caracteres.")
    @Column(unique = true, length = 120)
    private String email;
    
    @Column(length = 20, unique = true)
    @NotBlank(message = "A Senha É Obrigatório.")
    private String senha;
    
    

    
    public Colaboradores() {}
    public Colaboradores(Long id, String nome, String cpf, String email, String senha) {
    	this.id = id;
    	this.nome = nome;
    	this.cpf = cpf;
    	this.email = email;
    	this.senha = senha;

    }
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getNome() {
		return nome;
	}
	public void setNome(String nome) {
		this.nome = nome;
	}
	public String getCpf() {
		return cpf;
	}
	public void setCpf(String cpf) {
		this.cpf = cpf;
		
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getSenha() {
		return senha;
	}
	public void setSenha(String senha) {
		this.senha = senha;
	}
    
    
}
