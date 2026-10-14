package com.pennywise.service;

import com.pennywise.dto.AuthResponse;
import com.pennywise.dto.LoginRequest;
import com.pennywise.dto.RegisterRequest;
import com.pennywise.dto.UserDto;
import com.pennywise.exception.ConflictException;
import com.pennywise.model.Category;
import com.pennywise.model.TransactionType;
import com.pennywise.model.User;
import com.pennywise.repository.CategoryRepository;
import com.pennywise.repository.UserRepository;
import com.pennywise.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       CategoryRepository categoryRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with that email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName().trim(), email, encodedPassword);
        user = userRepository.save(user);

        // Seed default starter categories for new users
        seedDefaultCategories(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new UserDto(user.getId(), user.getName(), user.getEmail()));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Incorrect email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new UserDto(user.getId(), user.getName(), user.getEmail()));
    }

    private void seedDefaultCategories(User user) {
        List<String> expenseCategories = List.of("Food", "Rent", "Transport", "Entertainment", "Utilities", "Shopping", "Others");
        for (String name : expenseCategories) {
            categoryRepository.save(new Category(name, TransactionType.EXPENSE, user));
        }

        List<String> incomeCategories = List.of("Salary", "Allowance", "Investment", "Freelance", "Others");
        for (String name : incomeCategories) {
            categoryRepository.save(new Category(name, TransactionType.INCOME, user));
        }
    }
}

