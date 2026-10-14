package com.pennywise.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class BudgetRequest {

    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "0.0", message = "Budget amount cannot be negative")
    private Double amount;

    public BudgetRequest() {
    }

    public BudgetRequest(Double amount) {
        this.amount = amount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}

