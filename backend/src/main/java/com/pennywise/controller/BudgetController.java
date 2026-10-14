package com.pennywise.controller;

import com.pennywise.dto.BudgetRequest;
import com.pennywise.dto.BudgetResponse;
import com.pennywise.security.UserPrincipal;
import com.pennywise.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(@AuthenticationPrincipal UserPrincipal principal) {
        List<BudgetResponse> budgets = budgetService.getBudgets(principal.getUser());
        return ResponseEntity.ok(budgets);
    }

    @PutMapping("/{month}")
    public ResponseEntity<BudgetResponse> setBudget(@PathVariable String month,
                                                    @Valid @RequestBody BudgetRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        BudgetResponse response = budgetService.setBudget(month, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{month}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String month,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        budgetService.deleteBudget(month, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}

