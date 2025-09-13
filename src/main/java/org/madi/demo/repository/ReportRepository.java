package org.madi.demo.repository;

import org.madi.demo.entities.Report;
import org.madi.demo.entities.Report.ReportStatus;
import org.madi.demo.entities.Report.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

	List<Report> findByStatus(ReportStatus status);

	List<Report> findByType(ReportType type);

	List<Report> findByTargetUsername(String username);

	@Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :start AND :end")
	List<Report> findBetweenDates(@Param("start") LocalDateTime start,
								  @Param("end") LocalDateTime end);

	@Query("SELECT r.targetUsername, COUNT(r) as count FROM Report r " +
			"WHERE r.status = 'PENDING' GROUP BY r.targetUsername ORDER BY count DESC")
	Page<Object[]> findMostReportedUsers(Pageable pageable);

	long countByStatus(ReportStatus status);

	List<Report> findByTargetUsernameAndTypeAndStatus(String username, ReportType type, ReportStatus status);
}