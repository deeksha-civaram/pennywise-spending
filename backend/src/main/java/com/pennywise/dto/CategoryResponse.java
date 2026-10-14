package com.pennywise.dto;

import com.pennywise.model.Category;
import com.pennywise.model.TransactionType;

public class CategoryResponse {
    private String id;
    private String userId;
    private String name;
    private TransactionType type;

    public CategoryResponse() {
    }

    public CategoryResponse(String id, String userId, String name, TransactionType type) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
    }

    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getUser() != null ? category.getUser().getId() : null,
            category.getName(),
            category.getType()
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }
}

