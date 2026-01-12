package com.xebia.talentacquisition.dto;

import com.xebia.talentacquisition.entity.Skill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDTO {
    @NotBlank(message = "Skill name is required")
    private String name;
    
    @NotNull(message = "Skill level is required")
    private Skill.SkillLevel level;
    
    @NotNull(message = "Skill type is required")
    private Skill.SkillType type;
    
    private Integer yearsOfExperience;
}
