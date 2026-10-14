package com.pennywise.dto;

import com.pennywise.model.Budget;

public class BudgetResponse {
    private String id;
    private String userId;
    private String month;
    private Double amount;

    public BudgetResponse() {
    }

    public BudgetResponse(String id, String userId, String month, Double amount) {
        this.id = id;
        this.userId = userId;
        this.month = month;
        this.amount = amount;
    }

    public static BudgetResponse fromEntity(Budget b) {
        return new BudgetResponse(
            b.getId(),
            b.getUser() != null ? b.getUser().getId() : null,
            b.getMonth(),
            b.getAmount()
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}

