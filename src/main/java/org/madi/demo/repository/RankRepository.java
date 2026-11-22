package org.madi.demo.repository;

import java.util.List;
import java.util.Optional;
import org.madi.demo.entities.Rank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RankRepository extends JpaRepository<Rank, Long> {
    List<Rank> findAllByOrderByLevelAsc();

    Optional<Rank> findByName(String name);
}
