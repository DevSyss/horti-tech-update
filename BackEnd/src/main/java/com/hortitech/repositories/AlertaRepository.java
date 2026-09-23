package com.hortitech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hortitech.entities.Alerta;

public interface AlertaRepository extends JpaRepository<Alerta, Long> { 

}