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
@Table(name = "tb_regitroTermico")
public class RegistroTermico {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@NotBlank(message = "A Temperatura É Obrigatória")
	private Double temperatura;
	
	@NotBlank(message = "A Umidade É Obrigatória")
	private Double umidade;
	
	@NotBlank(message = "A Data É Obrigatória")
	@PastOrPresent(message = "A Hora Precisa Ser Necessáriamente No Presente")
	private LocalDateTime dataHora;
	
	
	 public RegistroTermico() {}
	 public RegistroTermico (Long id, Double temperatura, Double umidade, LocalDateTime dataHora) {
		 this.id = id;
		 this.temperatura = temperatura;
		 this.umidade = umidade;
		 this.dataHora = dataHora;
	
	}
	 public Long getId() {
		 return id;
	 }
	 public void setId(Long id) {
		 this.id = id;
	 }
	 public Double getTemperatura() {
		 return temperatura;
	 }
	 public void setTemperatura(Double temperatura) {
		 this.temperatura = temperatura;
	 }
	 public Double getUmidade() {
		 return umidade;
	 }
	 public void setUmidade(Double umidade) {
		 this.umidade = umidade;
	 }
	 public LocalDateTime getDataHora() {
		 return dataHora;
	 }
	 public void setDataHora(LocalDateTime dataHora) {
		 this.dataHora = dataHora;
	 }
	 
	 
}
