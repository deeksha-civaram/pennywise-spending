package com.pennywise.controller;

import com.pennywise.dto.TransactionRequest;
import com.pennywise.dto.TransactionResponse;
import com.pennywise.security.UserPrincipal;
import com.pennywise.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(@AuthenticationPrincipal UserPrincipal principal) {
        List<TransactionResponse> transactions = transactionService.getTransactions(principal.getUser());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable String id,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        TransactionResponse response = transactionService.getTransaction(id, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        TransactionResponse response = transactionService.createTransaction(request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(@PathVariable String id,
                                                                 @Valid @RequestBody TransactionRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        TransactionResponse response = transactionService.updateTransaction(id, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        transactionService.deleteTransaction(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}

