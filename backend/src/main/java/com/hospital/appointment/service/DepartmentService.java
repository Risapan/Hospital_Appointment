package com.hospital.appointment.service;

import com.hospital.appointment.dto.DepartmentDto;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.Department;
import com.hospital.appointment.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentDto> getAllActiveDepartments() {
        return departmentRepository.findByActive(true).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return toDto(dept);
    }

    public DepartmentDto createDepartment(DepartmentDto dto) {
        Department dept = new Department(dto.getName(), dto.getDescription(), dto.getIcon());
        dept.setActive(dto.isActive());
        Department saved = departmentRepository.save(dept);
        return toDto(saved);
    }

    public DepartmentDto updateDepartment(String id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        dept.setIcon(dto.getIcon());
        dept.setActive(dto.isActive());

        Department updated = departmentRepository.save(dept);
        return toDto(updated);
    }

    public void deleteDepartment(String id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentDto toDto(Department d) {
        return new DepartmentDto(d.getId(), d.getName(), d.getDescription(), d.getIcon(), d.isActive());
    }
}
