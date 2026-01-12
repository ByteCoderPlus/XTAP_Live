package com.xebia.talentacquisition.controller;

import com.xebia.talentacquisition.dto.AccountDTO;
import com.xebia.talentacquisition.dto.ApiResponse;
import com.xebia.talentacquisition.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAllAccounts() {
        ApiResponse<List<AccountDTO>> response = accountService.getAllAccounts();
        return ResponseEntity.ok(response);
    }
}
