package com.pennywise.dto;

import com.pennywise.model.Transaction;
import com.pennywise.model.TransactionType;

public class TransactionResponse {
    private String id;
    private String userId;
    private TransactionType type;
    private Double amount;
    private String category;
    private String date;
    private String description;
    private String createdAt;
    private String updatedAt;

    public TransactionResponse() {
    }

    public TransactionResponse(String id, String userId, TransactionType type, Double amount,
                               String category, String date, String description,
                               String createdAt, String updatedAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TransactionResponse fromEntity(Transaction t) {
        return new TransactionResponse(
            t.getId(),
            t.getUser() != null ? t.getUser().getId() : null,
            t.getType(),
            t.getAmount(),
            t.getCategory(),
            t.getDate(),
            t.getDescription(),
            t.getCreatedAt() != null ? t.getCreatedAt().toString() : null,
            t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null
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

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}

