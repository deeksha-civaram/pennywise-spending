package com.pennywise.repository;

import com.pennywise.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findByUserId(String userId);
    Optional<Budget> findByUserIdAndMonth(String userId, String month);
    void deleteByUserIdAndMonth(String userId, String month);
}

