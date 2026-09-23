package com.hortitech.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "tb_camaraFria")
public class CamaraFria {


			@Id
		    @GeneratedValue(strategy = GenerationType.IDENTITY)
		    private Long id;

		    @NotBlank(message = "O Local É Obrigatório.")
		    private String local;
			
			private Double temperaturaMinima;
			
			@NotBlank(message = "A Temperatura É Obrigatória")
			private Double temperaturaMaxima;

			private boolean statusAtivo;
			
		    
		    public CamaraFria() {}
		    public CamaraFria(long id, String local, Double temperaturaMinima, Double temperaturaMaxima, boolean statusAtivo ) {
		    	this.id = id;
		    	this.local = local;
		    	this.temperaturaMinima = temperaturaMinima;
		    	this.temperaturaMaxima = temperaturaMaxima;
		    	this.statusAtivo = statusAtivo;
		    
		    
	}
			public Long getId() {
				return id;
			}
			public void setId(Long id) {
				this.id = id;
			}
			public String getLocal() {
				return local;
			}
			public void setLocal(String local) {
				this.local = local;
			}
			public Double getTemperaturaMinima() {
				return temperaturaMinima;
			}
			public void setTemperaturaMinima(Double temperaturaMinima) {
				this.temperaturaMinima = temperaturaMinima;
			}
			public Double getTemperaturaMaxima() {
				return temperaturaMaxima;
			}
			public void setTemperaturaMaxima(Double temperaturaMaxima) {
				this.temperaturaMaxima = temperaturaMaxima;
			}
			public boolean getStatusAtivo() {
				return statusAtivo;
			}
			public void setStatusAtivo(boolean statusAtivo) {
				this.statusAtivo = statusAtivo;
			}

		    
}
