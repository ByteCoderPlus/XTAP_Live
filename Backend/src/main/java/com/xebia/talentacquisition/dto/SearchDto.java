package com.xebia.talentacquisition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDto {
    
    @Builder.Default
    private List<String> skills = new ArrayList<>();
    
    private String location;
    
    private Integer experience; // Filter by total experience
    
    @Builder.Default
    private Integer page = 1;
    
    @Builder.Default
    private Integer limit = 10;
    
    private String sortBy;
    
    @Builder.Default
    private String sortOrder = "asc";
}
