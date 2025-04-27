package org.madi.demo.repository;

import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	User findByNickname(String nickname);
	User findByEmail(String email);
	List<User> findByNicknameContainingIgnoreCase(String nickname, Pageable pageable);
}
