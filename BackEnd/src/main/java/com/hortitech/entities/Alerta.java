package com.hortitech.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;

@Entity
@Table(name = "tb_alertas")
public class Alerta {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

	@NotBlank
	private String tipo;
	
	@NotBlank 
	private String mensagem;
	
	@NotBlank
	@PastOrPresent(message = "A Hora Precisa Ser Necessáriamente No Presente")
	private LocalDateTime dataHora;
	
	@NotBlank
	private boolean status;
	

	public Alerta() {}
	public Alerta(Long id, String tipo, String mensagem, LocalDateTime dataHora, boolean status) {
		this.id = id;
		this.tipo = tipo;
		this.mensagem = mensagem;
		this.dataHora = dataHora;
		this.status = status;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTipo() {
		return tipo;
	}
	public void setTipo(String tipo) {
		this.tipo = tipo;
	}
	public String getMensagem() {
		return mensagem;
	}
	public void setMensagem(String mensagem) {
		this.mensagem = mensagem;
	}
	public LocalDateTime getDataHora() {
		return dataHora;
	}
	public void setDataHora(LocalDateTime dataHora) {
		this.dataHora = dataHora;
	}
	public boolean isStatus() {
		return status;
	}
	public void setStatus(boolean status) {
		this.status = status;
	}
	
	
	
}