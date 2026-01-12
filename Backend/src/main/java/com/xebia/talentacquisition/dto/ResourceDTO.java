package com.xebia.talentacquisition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xebia.talentacquisition.entity.Resource;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String designation;
    
    private String location;
    
    private Resource.ResourceStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate availabilityDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseDate;
    
    private Integer totalExperience;
    
    @Builder.Default
    private List<SkillDTO> skills = new ArrayList<>();
    
    @Builder.Default
    private List<SoftBlockDTO> softBlocks = new ArrayList<>();
    
    private Double ctc;
    
    private String ctcCurrency;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
