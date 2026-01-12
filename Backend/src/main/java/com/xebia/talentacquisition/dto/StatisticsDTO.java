package com.xebia.talentacquisition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {
    private Long total;
    private Long atp;
    private Long deployed;
    private Long softBlocked;
    
    @Builder.Default
    private Map<String, Long> byStatus = new HashMap<>();
    
    @Builder.Default
    private Map<String, Long> byLocation = new HashMap<>();
}
