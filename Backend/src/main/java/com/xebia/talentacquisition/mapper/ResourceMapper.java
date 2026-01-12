package com.xebia.talentacquisition.mapper;

import com.xebia.talentacquisition.dto.*;
import com.xebia.talentacquisition.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ResourceMapper {

    public ResourceDTO toDTO(Resource resource) {
        if (resource == null) return null;
        
        return ResourceDTO.builder()
                .employeeId(resource.getEmployeeId())
                .name(resource.getName())
                .email(resource.getEmail())
                .designation(resource.getDesignation())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .availabilityDate(resource.getAvailabilityDate())
                .releaseDate(resource.getReleaseDate())
                .totalExperience(resource.getTotalExperience())
                .skills(resource.getSkills().stream().map(this::skillToDTO).collect(Collectors.toList()))
                .softBlocks(resource.getSoftBlocks() != null 
                        ? resource.getSoftBlocks().stream()
                                .map(this::softBlockToDTO)
                                .collect(Collectors.toList())
                        : new ArrayList<>())
                .ctc(resource.getCtc())
                .ctcCurrency(resource.getCtcCurrency())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    public Resource toEntity(ResourceDTO dto) {
        if (dto == null) return null;

        return Resource.builder()
                .employeeId(dto.getEmployeeId())
                .name(dto.getName())
                .email(dto.getEmail())
                .designation(dto.getDesignation())
                .location(dto.getLocation())
                .status(dto.getStatus() != null ? dto.getStatus() : Resource.ResourceStatus.ATP)
                .availabilityDate(dto.getAvailabilityDate())
                .releaseDate(dto.getReleaseDate())
                .totalExperience(dto.getTotalExperience())
                .skills(dto.getSkills().stream().map(this::skillToEntity).collect(Collectors.toList()))
                .ctc(dto.getCtc())
                .ctcCurrency(dto.getCtcCurrency())
                .build();
    }

    public SkillDTO skillToDTO(Skill skill) {
        if (skill == null) return null;
        return SkillDTO.builder()
                .name(skill.getName())
                .level(skill.getLevel())
                .type(skill.getType())
                .yearsOfExperience(skill.getYearsOfExperience())
                .build();
    }

    public Skill skillToEntity(SkillDTO dto) {
        if (dto == null) return null;
        return Skill.builder()
                .name(dto.getName())
                .level(dto.getLevel())
                .type(dto.getType())
                .yearsOfExperience(dto.getYearsOfExperience())
                .build();
    }

    public SoftBlockDTO softBlockToDTO(com.xebia.talentacquisition.entity.ResourceSoftBlock softBlock) {
        if (softBlock == null || softBlock.getAccount() == null) return null;
        return SoftBlockDTO.builder()
                .accountId(softBlock.getAccount().getId())
                .accountName(softBlock.getAccount().getName())
                .blockedUntil(softBlock.getBlockedUntil())
                .build();
    }

}
