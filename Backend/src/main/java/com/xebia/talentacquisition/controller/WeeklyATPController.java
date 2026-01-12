package com.xebia.talentacquisition.controller;

import com.xebia.talentacquisition.dto.*;
import com.xebia.talentacquisition.service.WeeklyATPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/weekly-atp")
@RequiredArgsConstructor
public class WeeklyATPController {

    private final WeeklyATPService weeklyATPService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WeeklyATPSummaryDTO>> getWeeklyATPSummary(
            @RequestParam(required = false) String week,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer weekNumber) {
        ApiResponse<WeeklyATPSummaryDTO> response = weeklyATPService.getWeeklyATPSummary(week, year, weekNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-skill")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getATPBySkill(
            @RequestParam(required = false) String week) {
        ApiResponse<Map<String, Integer>> response = weeklyATPService.getATPBySkill(week);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-location")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getATPByLocation(
            @RequestParam(required = false) String week) {
        ApiResponse<Map<String, Integer>> response = weeklyATPService.getATPByLocation(week);
        return ResponseEntity.ok(response);
    }
}
