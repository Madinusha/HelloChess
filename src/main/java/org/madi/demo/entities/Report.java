package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {
	public enum ReportType {
		MESSAGE, ACCOUNT, GAME, OTHER
	}

	public enum ReportStatus {
		PENDING, RESOLVED, REJECTED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ReportType type;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_id", nullable = false)
	private User reporter;

	@Column(name = "target_username", nullable = false)
	private String targetUsername;

	@Column(columnDefinition = "TEXT")
	private String message;

	@Column(nullable = false)
	private Integer count = 0;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ReportStatus status = ReportStatus.PENDING;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "resolved_at")
	private LocalDateTime resolvedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "resolved_by")
	private User resolvedBy;

	@Column(name = "resolution_comment")
	private String resolutionComment;
}