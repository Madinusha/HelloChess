package org.madi.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.madi.demo.enums.ReportStatus;
import org.madi.demo.enums.ReportType;

import java.time.LocalDateTime;

/**
 * Жалоба
 */
@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {
    /**
     * id
     */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    /**
     * Тип жалобы
     */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ReportType type;
    /**
     * Пользователь, который пожаловался
     */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_id", nullable = false)
	private User reporter;
    /**
     * Имя пользователя, на которого пожаловались
     */
	@Column(name = "target_username", nullable = false)
	private String targetUsername;
    /**
     * Сообщение, на которое пожаловались
     */
	@Column(name = "message", columnDefinition = "TEXT")
	private String message;
    /**
     * Количество жалоб
     */
	@Column(name = "count", nullable = false)
	private Integer count = 0;
    /**
     * Статус жалобы
     */
	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private ReportStatus status = ReportStatus.PENDING;
    /**
     * Дата и время создания жалобы
     */
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
    /**
     * Дата и время решение относительно жалобы
     */
	@Column(name = "resolved_at")
	private LocalDateTime resolvedAt;
    /**
     * Имя пользователя, вынесевшего реение
     */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "resolved_by")
	private User resolvedBy;
    /**
     * Комментарий к решению
     */
	@Column(name = "resolution_comment")
	private String resolutionComment;
}