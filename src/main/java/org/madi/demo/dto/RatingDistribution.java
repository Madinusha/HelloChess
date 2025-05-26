package org.madi.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RatingDistribution {
	private String range;
	private long count;
	private double percentage;

	public RatingDistribution() {}

	public RatingDistribution(String range, long count) {
		this.range = range;
		this.count = count;
	}
}