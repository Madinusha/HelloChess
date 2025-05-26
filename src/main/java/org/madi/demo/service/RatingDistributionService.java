package org.madi.demo.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.madi.demo.entities.User;
import org.madi.demo.dto.RatingDistribution;
import org.madi.demo.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingDistributionService {

	private final UserRepository userRepository;

	public RatingDistributionService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public RatingDistributionData getRatingDistributionData(Authentication auth) {
		List<RatingDistribution> distribution = userRepository.getRatingDistribution();
		long total = userRepository.count();

		// Добавляем расчет процентов
		distribution.forEach(d -> {
			double percentage = total > 0 ? (d.getCount() * 100.0) / total : 0;
			d.setPercentage(Math.round(percentage * 10) / 10.0); // Округляем до 1 знака
		});

		int currentRating = getCurrentUserRating(auth);
		double avgRating = userRepository.getAverageRating();

		return new RatingDistributionData(distribution, currentRating, (long) avgRating, total);
	}

	private double calculatePercentage(long count, long total) {
		return total > 0 ? (double) count / total * 100 : 0;
	}

	private int getCurrentUserRating(Authentication authentication) {
		if (authentication != null && authentication.getPrincipal() instanceof User) {
			return ((User) authentication.getPrincipal()).getRating();
		}
		return 0;
	}

	@Getter
	@AllArgsConstructor
	public static class RatingDistributionData {
		private List<RatingDistribution> distribution;
		private int currentUserRating;
		private long averageRating;
		private long totalPlayers;
	}
}