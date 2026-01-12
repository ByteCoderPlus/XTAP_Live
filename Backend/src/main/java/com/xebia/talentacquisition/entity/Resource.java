package com.xebia.talentacquisition.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "resources", indexes = {
    @Index(name = "idx_resource_email", columnList = "email"),
    @Index(name = "idx_resource_status", columnList = "status"),
    @Index(name = "idx_resource_location", columnList = "location"),
    @Index(name = "idx_resource_employee_id", columnList = "employee_id")
})
public class Resource extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "location", length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ATP;

    @Column(name = "availability_date")
    private LocalDate availabilityDate;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "total_experience")
    private Integer totalExperience;

    @ElementCollection
    @CollectionTable(name = "resource_skills", joinColumns = @JoinColumn(name = "resource_id"))
    @AttributeOverrides({
        @AttributeOverride(name = "name", column = @Column(name = "skill_name")),
        @AttributeOverride(name = "level", column = @Column(name = "skill_level")),
        @AttributeOverride(name = "type", column = @Column(name = "skill_type")),
        @AttributeOverride(name = "yearsOfExperience", column = @Column(name = "years_of_experience"))
    })
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();


    
    @Column(name = "ctc")
    private Double ctc;

    @Column(name = "ctc_currency", length = 10)
    private String ctcCurrency;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResourceSoftBlock> softBlocks = new ArrayList<>();

    public enum ResourceStatus {
        ATP, DEPLOYED, SOFT_BLOCKED, NOTICE, LEAVE, TRAINEE, INTERVIEW_SCHEDULED
    }
}
