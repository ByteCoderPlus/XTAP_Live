package com.xebia.talentacquisition.service;

import com.xebia.talentacquisition.dto.AccountDTO;
import com.xebia.talentacquisition.dto.ApiResponse;
import com.xebia.talentacquisition.entity.Account;
import com.xebia.talentacquisition.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;

    public ApiResponse<List<AccountDTO>> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        List<AccountDTO> accountDTOs = accounts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ApiResponse.<List<AccountDTO>>builder()
                .data(accountDTOs)
                .build();
    }

    private AccountDTO toDTO(Account account) {
        if (account == null) return null;
        
        return AccountDTO.builder()
                .id(account.getId())
                .name(account.getName())
                .description(account.getDescription())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
