package com.algobuddy.backend.repository;

import com.algobuddy.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    @Query("SELECT p FROM UserProfile p WHERE p.userId IN (SELECT f.friendId FROM Friendship f WHERE f.userId = :userId)")
    List<UserProfile> findFriendsProfilesByUserId(@Param("userId") UUID userId);
}
