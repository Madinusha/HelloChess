package org.madi.demo.repository;

import org.madi.demo.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	User findByNickname(String nickname);
	User findByEmail(String email);
}
