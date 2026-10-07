package com.hortitech.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_usuarios")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne(cascade = CascadeType.ALL)
	private Colaboradores colaboradores;

	@Email(message = "E-mail inválido.")
	@Size(max = 120, message = "O E-mail Deve Ter No Máximo 120 Caracteres.")
	@Column(unique = true, length = 120)
	private String email;

	//@Column(length = 20, unique = true)
	@NotBlank(message = "A Senha É Obrigatório.")
	private String senha;

	@NotBlank(message = "O Tipo É Obrigatório")
	@Column(nullable = false)
	private String tipo;

	public Usuario() {
	}

	public Usuario(Long id, String email, String senha, String tipo) {
		this.id = id;
		this.email = email;
		this.senha = senha;
		this.tipo = tipo;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

}