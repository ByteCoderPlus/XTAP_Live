package com.xebia.talentacquisition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyATPSummaryDTO {
    private String week;
    private Integer totalATP;
    private Integer newATP;
    private Integer deployed;
    private Integer softBlocked;
    
    @Builder.Default
    private Map<String, Integer> bySkill = new HashMap<>();
    
    @Builder.Default
    private Map<String, Integer> byLocation = new HashMap<>();
    
    @Builder.Default
    private List<ResourceDTO> topRecommendations = new ArrayList<>();
}
