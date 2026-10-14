package com.pennywise.controller;

import com.pennywise.dto.CategoryRequest;
import com.pennywise.dto.CategoryResponse;
import com.pennywise.security.UserPrincipal;
import com.pennywise.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(@AuthenticationPrincipal UserPrincipal principal) {
        List<CategoryResponse> categories = categoryService.getCategories(principal.getUser());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        CategoryResponse response = categoryService.createCategory(request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable String id,
                                                           @Valid @RequestBody CategoryRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        CategoryResponse response = categoryService.updateCategory(id, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        categoryService.deleteCategory(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}

