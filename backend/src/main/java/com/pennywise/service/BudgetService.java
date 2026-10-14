package com.pennywise.service;

import com.pennywise.dto.BudgetRequest;
import com.pennywise.dto.BudgetResponse;
import com.pennywise.model.Budget;
import com.pennywise.model.User;
import com.pennywise.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public List<BudgetResponse> getBudgets(User user) {
        return budgetRepository.findByUserId(user.getId())
                .stream()
                .map(BudgetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse setBudget(String month, BudgetRequest request, User user) {
        Budget budget = budgetRepository.findByUserIdAndMonth(user.getId(), month)
                .orElseGet(() -> new Budget(month, request.getAmount(), user));

        budget.setAmount(request.getAmount());
        Budget saved = budgetRepository.save(budget);
        return BudgetResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteBudget(String month, User user) {
        budgetRepository.findByUserIdAndMonth(user.getId(), month)
                .ifPresent(budgetRepository::delete);
    }
}

