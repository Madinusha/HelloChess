package org.madi.demo.repository;

import org.madi.demo.entities.Task;
import org.madi.demo.entities.User;
import org.madi.demo.entities.UserTaskProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTaskProgressRepository extends JpaRepository<UserTaskProgress, Long> {
	Optional<UserTaskProgress> findByUserAndTask(User user, Task task);
	List<UserTaskProgress> findByUserAndTaskIn(User user, List<Task> tasks);
}