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
public class SkillBasedSearchDto {
    
    @Builder.Default
    private List<String> primarySkills = new ArrayList<>(); // Required - validate in controller/service
    
    @Builder.Default
    private List<String> secondarySkills = new ArrayList<>();
    
        private String location;
    
    private Integer experience; // Total experience
    
    // Map of skill name to required years of experience for that skill
    // Example: {"Java": 3, "Spring Boot": 2}
    @Builder.Default
    private Map<String, Integer> skillExperienceMap = new HashMap<>();
}
