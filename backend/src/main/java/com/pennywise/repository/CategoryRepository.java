package com.pennywise.repository;

import com.pennywise.model.Category;
import com.pennywise.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByUserId(String userId);
    Optional<Category> findByIdAndUserId(String id, String userId);
    boolean existsByUserIdAndNameIgnoreCaseAndType(String userId, String name, TransactionType type);
    boolean existsByUserIdAndNameIgnoreCaseAndTypeAndIdNot(String userId, String name, TransactionType type, String id);
}

