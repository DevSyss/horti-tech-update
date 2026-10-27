
package com.hortitech.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "tb_camara")
public class CamaraFria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório.")
    @Pattern(
        regexp = "^[\\p{L} ]+$",
        message = "O nome deve conter apenas letras e espaços."
    )
    private String nome;

    @NotBlank(message = "O local é obrigatório.")
    private String local;

    @NotNull(message = "A temperatura mínima é obrigatória.")
    private Double temperaturaMinima;

    @NotNull(message = "A temperatura máxima é obrigatória.")
    private Double temperaturaMaxima;

    @NotBlank(message = "O sensor é obrigatório.")
    private String sensor;

    public CamaraFria() {
    }

    public CamaraFria(
            Long id,
            String local,
            Double temperaturaMinima,
            Double temperaturaMaxima,
            String nome,
            String sensor) {

        this.id = id;
        this.local = local;
        this.temperaturaMinima = temperaturaMinima;
        this.temperaturaMaxima = temperaturaMaxima;
        this.nome = nome;
        this.sensor = sensor;
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

    public String getSensor() {
        return sensor;
    }

    public void setSensor(String sensor) {
        this.sensor = sensor;
    }
}
