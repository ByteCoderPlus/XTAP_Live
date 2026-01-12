package com.xebia.talentacquisition.service;

import com.xebia.talentacquisition.dto.*;
import com.xebia.talentacquisition.entity.Resource;
import com.xebia.talentacquisition.entity.Skill;
import com.xebia.talentacquisition.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WeeklyATPService {

    private final ResourceRepository resourceRepository;

    public ApiResponse<WeeklyATPSummaryDTO> getWeeklyATPSummary(String week, Integer year, Integer weekNumber) {
        LocalDate weekDate = week != null ? LocalDate.parse(week) : LocalDate.now();
        
        List<Resource> allResources = resourceRepository.findAll();
        List<Resource> atpResources = allResources.stream()
                .filter(r -> r.getStatus() == Resource.ResourceStatus.ATP)
                .toList();
        
        Map<String, Integer> bySkill = new HashMap<>();
        Map<String, Integer> byLocation = new HashMap<>();
        
        for (Resource resource : atpResources) {
            for (Skill skill : resource.getSkills()) {
                bySkill.put(skill.getName(), bySkill.getOrDefault(skill.getName(), 0) + 1);
            }
            if (resource.getLocation() != null) {
                byLocation.put(resource.getLocation(), byLocation.getOrDefault(resource.getLocation(), 0) + 1);
            }
        }
        
        WeeklyATPSummaryDTO summary = WeeklyATPSummaryDTO.builder()
                .week(weekDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .totalATP(atpResources.size())
                .newATP(0)
                .deployed(0)
                .softBlocked(0)
                .bySkill(bySkill)
                .byLocation(byLocation)
                .topRecommendations(new ArrayList<>()) // Can be populated with ResourceDTOs if needed
                .build();
        
        return ApiResponse.<WeeklyATPSummaryDTO>builder()
                .data(summary)
                .build();
    }

    public ApiResponse<Map<String, Integer>> getATPBySkill(String week) {
        List<Resource> atpResources = resourceRepository.findAll().stream()
                .filter(r -> r.getStatus() == Resource.ResourceStatus.ATP)
                .toList();
        
        Map<String, Integer> bySkill = new HashMap<>();
        for (Resource resource : atpResources) {
            for (Skill skill : resource.getSkills()) {
                bySkill.put(skill.getName(), bySkill.getOrDefault(skill.getName(), 0) + 1);
            }
        }
        
        return ApiResponse.<Map<String, Integer>>builder()
                .data(bySkill)
                .build();
    }

    public ApiResponse<Map<String, Integer>> getATPByLocation(String week) {
        List<Resource> atpResources = resourceRepository.findAll().stream()
                .filter(r -> r.getStatus() == Resource.ResourceStatus.ATP)
                .toList();
        
        Map<String, Integer> byLocation = new HashMap<>();
        for (Resource resource : atpResources) {
            if (resource.getLocation() != null) {
                byLocation.put(resource.getLocation(), byLocation.getOrDefault(resource.getLocation(), 0) + 1);
            }
        }
        
        return ApiResponse.<Map<String, Integer>>builder()
                .data(byLocation)
                .build();
    }
}
