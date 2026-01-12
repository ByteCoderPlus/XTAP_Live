package com.xebia.talentacquisition.service;

import com.xebia.talentacquisition.dto.*;
import com.xebia.talentacquisition.entity.Account;
import com.xebia.talentacquisition.entity.Resource;
import com.xebia.talentacquisition.mapper.ResourceMapper;
import com.xebia.talentacquisition.repository.AccountRepository;
import com.xebia.talentacquisition.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final AccountRepository accountRepository;
    private final ResourceMapper resourceMapper;

    public PaginationResponse<ResourceDTO> getAllResources(
            Integer page, Integer limit, Resource.ResourceStatus status,
            String location, String skill, String search, String sortBy, String sortOrder) {
        
        Pageable pageable = createPageable(page, limit, sortBy, sortOrder);
        String statusStr = status != null ? status.name() : null;
        Page<Resource> resourcePage = resourceRepository.findWithFilters(statusStr, location, skill, search, pageable);
        
        List<ResourceDTO> dtos = resourcePage.getContent().stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
        
        PaginationResponse.PaginationInfo paginationInfo = PaginationResponse.PaginationInfo.builder()
                .currentPage(resourcePage.getNumber() + 1)
                .totalPages(resourcePage.getTotalPages())
                .totalItems(resourcePage.getTotalElements())
                .itemsPerPage(resourcePage.getSize())
                .build();
        
        return PaginationResponse.<ResourceDTO>builder()
                .data(dtos)
                .pagination(paginationInfo)
                .build();
    }

    public ApiResponse<ResourceDTO> getResourceById(String id) {
        Resource resource = resourceRepository.findByEmployeeId(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return ApiResponse.<ResourceDTO>builder()
                .data(resourceMapper.toDTO(resource))
                .build();
    }

    public ApiResponse<ResourceDTO> createResource(ResourceDTO dto) {
        if (resourceRepository.findByEmployeeId(dto.getEmployeeId()).isPresent()) {
            throw new RuntimeException("Resource with employee ID already exists: " + dto.getEmployeeId());
        }
        if (resourceRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Resource with email already exists: " + dto.getEmail());
        }
        
        Resource resource = resourceMapper.toEntity(dto);
        resource = resourceRepository.save(resource);
        return ApiResponse.<ResourceDTO>builder()
                .data(resourceMapper.toDTO(resource))
                .build();
    }

    public ApiResponse<ResourceDTO> updateResource(Long id, ResourceDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        
        if (dto.getName() != null) resource.setName(dto.getName());
        if (dto.getEmail() != null) resource.setEmail(dto.getEmail());
        if (dto.getDesignation() != null) resource.setDesignation(dto.getDesignation());
        if (dto.getLocation() != null) resource.setLocation(dto.getLocation());
        if (dto.getStatus() != null) resource.setStatus(dto.getStatus());
        if (dto.getAvailabilityDate() != null) resource.setAvailabilityDate(dto.getAvailabilityDate());
        if (dto.getReleaseDate() != null) resource.setReleaseDate(dto.getReleaseDate());
        if (dto.getTotalExperience() != null) resource.setTotalExperience(dto.getTotalExperience());
        if (dto.getSkills() != null) {
            resource.setSkills(dto.getSkills().stream()
                    .map(resourceMapper::skillToEntity)
                    .collect(Collectors.toList()));
        }
        if (dto.getCtc() != null) resource.setCtc(dto.getCtc());
        if (dto.getCtcCurrency() != null) resource.setCtcCurrency(dto.getCtcCurrency());
        
        resource = resourceRepository.save(resource);
        return ApiResponse.<ResourceDTO>builder()
                .data(resourceMapper.toDTO(resource))
                .build();
    }

    public ApiResponse<Map<String, String>> deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        return ApiResponse.<Map<String, String>>builder()
                .data(Map.of("message", "Resource deleted successfully"))
                .build();
    }

    public ApiResponse<StatisticsDTO> getResourceStatistics() {
        List<Resource> allResources = resourceRepository.findAll();
        
        Map<String, Long> byStatus = allResources.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().name(),
                        Collectors.counting()
                ));
        
        Map<String, Long> byLocation = allResources.stream()
                .filter(r -> r.getLocation() != null)
                .collect(Collectors.groupingBy(
                        Resource::getLocation,
                        Collectors.counting()
                ));
        
        StatisticsDTO stats = StatisticsDTO.builder()
                .total((long) allResources.size())
                .atp(byStatus.getOrDefault("ATP", 0L))
                .deployed(byStatus.getOrDefault("DEPLOYED", 0L))
                .softBlocked(byStatus.getOrDefault("SOFT_BLOCKED", 0L))
                .byStatus(byStatus)
                .byLocation(byLocation)
                .build();
        
        return ApiResponse.<StatisticsDTO>builder()
                .data(stats)
                .build();
    }

    public ApiResponse<List<String>> getAvailableLocations() {
        List<String> locations = resourceRepository.findDistinctLocations();
        return ApiResponse.<List<String>>builder()
                .data(locations)
                .build();
    }

    public ApiResponse<List<String>> getAvailableSkills() {
        List<String> skills = resourceRepository.findDistinctSkillNames();
        return ApiResponse.<List<String>>builder()
                .data(skills)
                .build();
    }

    public List<ResourceDTO> exportResources(
            String format, Resource.ResourceStatus status,
            String location, String skill, String search) {
        // Get all resources matching filters (no pagination for export)
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        String statusStr = status != null ? status.name() : null;
        Page<Resource> resourcePage = resourceRepository.findWithFilters(
                statusStr, location, skill, search, pageable);
        
        return resourcePage.getContent().stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    private Pageable createPageable(Integer page, Integer limit, String sortBy, String sortOrder) {
        int pageNumber = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 10;
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
        
        Sort sort = sortBy != null 
                ? Sort.by(direction, sortBy)
                : Sort.by(Sort.Direction.ASC, "name");
        
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    public PaginationResponse<ResourceDTO> getResourcesBySkills(SearchDto searchDto) {
        
        // For skill search, we sort by match count (handled in query), so use unsorted Pageable
        int pageNumber = (searchDto.getPage() != null && searchDto.getPage() > 0) ? searchDto.getPage() - 1 : 0;
        int pageSize = (searchDto.getLimit() != null && searchDto.getLimit() > 0) ? searchDto.getLimit() : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        // Convert list of skills to comma-separated string for the query
        String skillNamesParam = (searchDto.getSkills() != null && !searchDto.getSkills().isEmpty())
                ? String.join(",", searchDto.getSkills())
                : null;
        String locationParam = Strings.isNotBlank(searchDto.getLocation()) ? searchDto.getLocation() : null;
        
        Page<Resource> resourcePage = resourceRepository.findBySkillsAndLocation(
                skillNamesParam, locationParam, searchDto.getExperience(), pageable);
        
        List<ResourceDTO> dtos = resourcePage.getContent().stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
        
        PaginationResponse.PaginationInfo paginationInfo = PaginationResponse.PaginationInfo.builder()
                .currentPage(resourcePage.getNumber() + 1)
                .totalPages(resourcePage.getTotalPages())
                .totalItems(resourcePage.getTotalElements())
                .itemsPerPage(resourcePage.getSize())
                .build();
        
        return PaginationResponse.<ResourceDTO>builder()
                .data(dtos)
                .pagination(paginationInfo)
                .build();
    }

    public PaginationResponse<ResourceDTO> searchByPrimaryAndSecondarySkills(
            com.xebia.talentacquisition.dto.SkillBasedSearchDto searchDto) {
        
        // Validate primary skills are provided
        if (searchDto.getPrimarySkills() == null || searchDto.getPrimarySkills().isEmpty()) {
            throw new RuntimeException("Primary skills are required");
        }
        
        // For skill search, we sort by match count (handled in query), so use unsorted Pageable
        int pageNumber = 0;
        int pageSize = 1000; // Large page size to get all results for in-memory filtering
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        // Convert lists to comma-separated strings for the query
        String primarySkillsParam = (searchDto.getPrimarySkills() != null && !searchDto.getPrimarySkills().isEmpty())
                ? String.join(",", searchDto.getPrimarySkills())
                : null;
        
        String secondarySkillsParam = (searchDto.getSecondarySkills() != null && !searchDto.getSecondarySkills().isEmpty())
                ? String.join(",", searchDto.getSecondarySkills())
                : null;
        
        Page<Resource> resourcePage = resourceRepository.findByPrimaryAndSecondarySkills(
                primarySkillsParam, secondarySkillsParam, 
                searchDto.getLocation(), searchDto.getExperience(), pageable);
        
        // Filter by skill experience requirements if provided
        // Also count total matched skills for sorting (primary + secondary matches)
        List<Resource> filteredResources = resourcePage.getContent();
        if (searchDto.getSkillExperienceMap() != null && !searchDto.getSkillExperienceMap().isEmpty()) {
            filteredResources = resourcePage.getContent().stream()
                    .filter(resource -> {
                        for (Map.Entry<String, Integer> entry : searchDto.getSkillExperienceMap().entrySet()) {
                            String skillName = entry.getKey();
                            Integer requiredExperience = entry.getValue();
                            
                            // Check if resource has this skill with required experience (as PRIMARY or SECONDARY)
                            boolean hasRequiredExperience = resource.getSkills().stream()
                                    .anyMatch(skill -> skill.getName().equals(skillName) 
                                            && skill.getYearsOfExperience() != null 
                                            && skill.getYearsOfExperience() >= requiredExperience);
                            
                            if (!hasRequiredExperience) {
                                return false;
                            }
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        }
        
        // Resources are already sorted by total matched skills (primary + secondary) from the query
        // The query sorts by (primary matches + secondary matches) descending, then by name
        // Secondary skills are "good to have" - resources are returned even without them
        
        List<ResourceDTO> dtos = filteredResources.stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
        
        // Calculate pagination info manually since we filtered in memory
        int totalItems = filteredResources.size();
        int totalPages = 1; // Since we fetch all and filter in memory
        
        PaginationResponse.PaginationInfo paginationInfo = PaginationResponse.PaginationInfo.builder()
                .currentPage(1)
                .totalPages(totalPages)
                .totalItems((long) totalItems)
                .itemsPerPage(totalItems > 0 ? totalItems : 1)
                .build();
        
        return PaginationResponse.<ResourceDTO>builder()
                .data(dtos)
                .pagination(paginationInfo)
                .build();
    }

    public ApiResponse<ResourceDTO> softBlockResource(String employeeId, Long accountId, java.time.LocalDate blockedUntil) {
        Resource resource = resourceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Resource not found with employee ID: " + employeeId));
        
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        
        // Check if already soft-blocked by this account
        com.xebia.talentacquisition.entity.ResourceSoftBlock existingBlock = resource.getSoftBlocks().stream()
                .filter(sb -> sb.getAccount().getId().equals(accountId))
                .findFirst()
                .orElse(null);
        
        if (existingBlock == null) {
            // Create new soft block
            com.xebia.talentacquisition.entity.ResourceSoftBlock softBlock = 
                com.xebia.talentacquisition.entity.ResourceSoftBlock.builder()
                    .resource(resource)
                    .account(account)
                    .blockedUntil(blockedUntil)
                    .build();
            resource.getSoftBlocks().add(softBlock);
        } else {
            // Update existing soft block date
            existingBlock.setBlockedUntil(blockedUntil);
        }
        
        Resource savedResource = resourceRepository.save(resource);
        
        return ApiResponse.<ResourceDTO>builder()
                .data(resourceMapper.toDTO(savedResource))
                .build();
    }
}
