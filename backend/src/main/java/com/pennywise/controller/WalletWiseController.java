
package com.pennywise.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pennywise.security.UserPrincipal;
import com.pennywise.service.WalletWiseService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/walletwise")
public class WalletWiseController {

    private final WalletWiseService walletWiseService;

    public WalletWiseController(WalletWiseService walletWiseService) {
        this.walletWiseService = walletWiseService;
    }

    public record AskRequest(
            @NotBlank(message = "Please enter a question.")
            @Size(max = 1000, message = "Question must be 1000 characters or fewer.")
            String question
    ) {}

    @PostMapping("/ask")
    public Map<String, String> ask(
            @Valid @RequestBody AskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) throws Exception {

        String answer = walletWiseService.ask(
                request.question(),
                principal.getUser()
        );

        return Map.of("answer", answer);
    }
}
