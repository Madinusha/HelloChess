package org.madi.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Уровни в шахматах
 */
@Entity
@Table(name = "ranks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rank {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Сокращенное название
     */
	@Column(name = "name", nullable = false, unique = true)
	private String name;
    /**
     * Полное название
     */
	@Column(name = "full_name", nullable = false)
	private String fullName;
    /**
     * Номер уровня
     */
	@Column(name = "level", nullable = false)
	private int level;
}
