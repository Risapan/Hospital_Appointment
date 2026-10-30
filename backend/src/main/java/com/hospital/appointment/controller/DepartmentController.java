package com.hospital.appointment.controller;

import com.hospital.appointment.dto.DepartmentDto;
import com.hospital.appointment.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getDepartments(@RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(departmentService.getAllActiveDepartments());
        }
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable String id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }
}
