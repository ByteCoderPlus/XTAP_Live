package com.xebia.talentacquisition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoftBlockDTO {
    
    private Long accountId;
    private String accountName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate blockedUntil;
}
