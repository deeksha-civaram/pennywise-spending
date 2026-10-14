package com.pennywise;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pennywise.dto.*;
import com.pennywise.model.TransactionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PennywiseApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("Full user workflow: Register, Login, Create Category, Transaction, Budget, and User Isolation")
    void testCompleteBackendWorkflow() throws Exception {
        // 1. Register User A
        RegisterRequest registerReqA = new RegisterRequest("Aarav Patel", "aarav@test.com", "secure123");
        MvcResult registerResultA = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReqA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("aarav@test.com"))
                .andReturn();

        AuthResponse authA = objectMapper.readValue(registerResultA.getResponse().getContentAsString(), AuthResponse.class);
        String tokenA = authA.getToken();
        assertThat(tokenA).isNotBlank();

        // 2. Duplicate registration should return 409 Conflict
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReqA)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with that email already exists"));

        // 3. Login with correct credentials
        LoginRequest loginReqA = new LoginRequest("aarav@test.com", "secure123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReqA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());

        // 4. Login with bad credentials should return 401 Unauthorized
        LoginRequest badLogin = new LoginRequest("aarav@test.com", "wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Incorrect email or password"));

        // 5. User A creates a transaction
        TransactionRequest txRequest = new TransactionRequest(
                TransactionType.EXPENSE,
                250.50,
                "Food",
                "2026-10-14",
                "Dinner at college mess"
        );
        MvcResult txResult = mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isString())
                .andExpect(jsonPath("$.amount").value(250.50))
                .andExpect(jsonPath("$.category").value("Food"))
                .andReturn();

        TransactionResponse createdTx = objectMapper.readValue(txResult.getResponse().getContentAsString(), TransactionResponse.class);

        // 6. User A gets transactions
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(createdTx.getId()));

        // 7. User A sets a budget
        BudgetRequest budgetReq = new BudgetRequest(15000.0);
        mockMvc.perform(put("/api/budgets/2026-10")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budgetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-10"))
                .andExpect(jsonPath("$.amount").value(15000.0));

        // 8. Register User B
        RegisterRequest registerReqB = new RegisterRequest("Diya Roy", "diya@test.com", "password456");
        MvcResult registerResultB = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReqB)))
                .andExpect(status().isOk())
                .andReturn();
        AuthResponse authB = objectMapper.readValue(registerResultB.getResponse().getContentAsString(), AuthResponse.class);
        String tokenB = authB.getToken();

        // 9. Verify User Isolation: User B cannot see User A's transactions
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // 10. User B cannot access or delete User A's transaction
        mockMvc.perform(get("/api/transactions/" + createdTx.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Transaction not found"));

        mockMvc.perform(delete("/api/transactions/" + createdTx.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());

        // 11. Categories: User A gets pre-seeded categories
        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThan(5)));

        // 12. Categories: User A creates a new category
        CategoryRequest catReq = new CategoryRequest("Gym", TransactionType.EXPENSE);
        MvcResult catResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gym"))
                .andReturn();
        CategoryResponse createdCat = objectMapper.readValue(catResult.getResponse().getContentAsString(), CategoryResponse.class);

        // 13. Categories: Duplicate category returns 409
        mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isConflict());

        // 14. User A deletes their transaction -> 204 No Content
        mockMvc.perform(delete("/api/transactions/" + createdTx.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());

        // 15. User A deletes their budget -> 204 No Content
        mockMvc.perform(delete("/api/budgets/2026-10")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNoContent());
    }
}

