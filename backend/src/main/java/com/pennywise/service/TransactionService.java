package com.pennywise.service;

import com.pennywise.dto.TransactionRequest;
import com.pennywise.dto.TransactionResponse;
import com.pennywise.exception.ResourceNotFoundException;
import com.pennywise.model.Transaction;
import com.pennywise.model.User;
import com.pennywise.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionResponse> getTransactions(User user) {
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransaction(String id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, User user) {
        Transaction transaction = new Transaction(
                request.getType(),
                request.getAmount(),
                request.getCategory().trim(),
                request.getDate(),
                request.getDescription().trim(),
                user
        );
        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(String id, TransactionRequest request, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory().trim());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription().trim());

        Transaction updated = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTransaction(String id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }
}

