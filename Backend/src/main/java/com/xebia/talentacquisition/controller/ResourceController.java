package com.xebia.talentacquisition.controller;

import com.xebia.talentacquisition.dto.*;
import com.xebia.talentacquisition.entity.Resource;
import com.xebia.talentacquisition.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<PaginationResponse<ResourceDTO>> getAllResources(
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false) Resource.ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        PaginationResponse<ResourceDTO> response = resourceService.getAllResources(
                page, limit, status, location, skill, search, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{empId}")
    public ResponseEntity<ApiResponse<ResourceDTO>> getResourceById(@PathVariable String empId) {
        ApiResponse<ResourceDTO> response = resourceService.getResourceById(empId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDTO>> createResource(@Valid @RequestBody ResourceDTO dto) {
        ApiResponse<ResourceDTO> response = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDTO>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDTO dto) {
        ApiResponse<ResourceDTO> response = resourceService.updateResource(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteResource(@PathVariable Long id) {
        ApiResponse<Map<String, String>> response = resourceService.deleteResource(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatisticsDTO>> getResourceStatistics() {
        ApiResponse<StatisticsDTO> response = resourceService.getResourceStatistics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableLocations() {
        ApiResponse<List<String>> response = resourceService.getAvailableLocations();
        return ResponseEntity.ok(response);
    }

        @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSkills() {
        ApiResponse<List<String>> response = resourceService.getAvailableSkills();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    public ResponseEntity<List<ResourceDTO>> exportResources(
            @RequestParam(required = false, defaultValue = "csv") String format,
            @RequestParam(required = false) Resource.ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String search) {
        List<ResourceDTO> resources = resourceService.exportResources(
                format, status, location, skill, search);
        
        // For now, return JSON. CSV/Excel export can be implemented later with proper libraries
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=resources." + format)
                .contentType(MediaType.APPLICATION_JSON)
                .body(resources);
    }

    @PostMapping("/{empId}/soft-block")
    public ResponseEntity<ApiResponse<ResourceDTO>> softBlockResource(
            @PathVariable String empId,
            @RequestParam Long accountId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate blockedUntil) {
        ApiResponse<ResourceDTO> response = resourceService.softBlockResource(empId, accountId, blockedUntil);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search-by-skills")
    public ResponseEntity<PaginationResponse<ResourceDTO>> getResourcesBySkills(
            @RequestBody SearchDto searchDto) {
        PaginationResponse<ResourceDTO> response = resourceService.getResourcesBySkills(searchDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search-by-primary-secondary-skills")
    public ResponseEntity<PaginationResponse<ResourceDTO>> searchByPrimaryAndSecondarySkills(
            @RequestBody com.xebia.talentacquisition.dto.SkillBasedSearchDto searchDto) {
        PaginationResponse<ResourceDTO> response = resourceService.searchByPrimaryAndSecondarySkills(searchDto);
        return ResponseEntity.ok(response);
    }
}
