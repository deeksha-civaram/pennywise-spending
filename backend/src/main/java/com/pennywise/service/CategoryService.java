package com.pennywise.service;

import com.pennywise.dto.CategoryRequest;
import com.pennywise.dto.CategoryResponse;
import com.pennywise.exception.ConflictException;
import com.pennywise.exception.ResourceNotFoundException;
import com.pennywise.model.Category;
import com.pennywise.model.User;
import com.pennywise.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getCategories(User user) {
        return categoryRepository.findByUserId(user.getId())
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User user) {
        String name = request.getName().trim();
        if (categoryRepository.existsByUserIdAndNameIgnoreCaseAndType(user.getId(), name, request.getType())) {
            throw new ConflictException("A category with that name and type already exists");
        }

        Category category = new Category(name, request.getType(), user);
        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(String id, CategoryRequest request, User user) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String name = request.getName().trim();
        if (categoryRepository.existsByUserIdAndNameIgnoreCaseAndTypeAndIdNot(user.getId(), name, request.getType(), id)) {
            throw new ConflictException("A category with that name and type already exists");
        }

        category.setName(name);
        category.setType(request.getType());
        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteCategory(String id, User user) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }
}

