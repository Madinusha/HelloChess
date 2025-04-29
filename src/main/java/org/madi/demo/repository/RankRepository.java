package org.madi.demo.repository;

import org.madi.demo.entities.Rank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RankRepository extends JpaRepository<Rank, Long> {
	List<Rank> findAllByOrderByLevelAsc();
	Optional<Rank> findByName(String name);
}