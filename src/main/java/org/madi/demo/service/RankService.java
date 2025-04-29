package org.madi.demo.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.madi.demo.entities.Rank;
import org.madi.demo.entities.User;
import org.madi.demo.repository.RankRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RankService {
	private final RankRepository rankRepository;
	public List<Rank> getAllRanksSorted() {
		return rankRepository.findAllByOrderByLevelAsc();
	}

	public Rank findById(Long id) {
		return rankRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Rank not found"));
	}

	public Rank findByName(String name) {
		return rankRepository.findByName(name)
				.orElseThrow(() -> new EntityNotFoundException("Rank not found"));
	}

	public void updateUserRank(User user, Long rankId) {
		Rank rank = findById(rankId);
		user.setRank(rank);
	}
}