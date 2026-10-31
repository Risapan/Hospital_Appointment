package com.hospital.appointment.service;

import com.hospital.appointment.dto.HospitalDto;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.Hospital;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.HospitalRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public HospitalService(HospitalRepository hospitalRepository, DoctorProfileRepository doctorProfileRepository) {
        this.hospitalRepository = hospitalRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public List<HospitalDto> getHospitals(boolean activeOnly) {
        List<Hospital> hospitals = activeOnly ? hospitalRepository.findByActive(true) : hospitalRepository.findAll();
        return hospitals.stream().map(this::toDto).collect(Collectors.toList());
    }

    public HospitalDto getHospitalById(String id) {
        return toDto(findHospital(id));
    }

    public Hospital findHospital(String id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    public HospitalDto createHospital(HospitalDto dto) {
        Hospital hospital = new Hospital();
        apply(hospital, dto);
        return toDto(hospitalRepository.save(hospital));
    }

    public HospitalDto updateHospital(String id, HospitalDto dto) {
        Hospital hospital = findHospital(id);
        apply(hospital, dto);
        return toDto(hospitalRepository.save(hospital));
    }

    private void apply(Hospital h, HospitalDto dto) {
        h.setName(dto.getName());
        h.setType(dto.getType());
        h.setSector(dto.getSector());
        h.setAddress(dto.getAddress());
        h.setCity(dto.getCity());
        h.setPhone(dto.getPhone());
        h.setWhatsapp(dto.getWhatsapp());
        h.setEmail(dto.getEmail());
        h.setWebsite(dto.getWebsite());
        h.setMapUrl(dto.getMapUrl());
        h.setDescription(dto.getDescription());
        h.setServices(dto.getServices() != null ? dto.getServices() : new ArrayList<>());
        h.setActive(dto.isActive());
    }

    private HospitalDto toDto(Hospital h) {
        HospitalDto dto = new HospitalDto();
        dto.setId(h.getId());
        dto.setName(h.getName());
        dto.setType(h.getType());
        dto.setSector(h.getSector());
        dto.setAddress(h.getAddress());
        dto.setCity(h.getCity());
        dto.setPhone(h.getPhone());
        dto.setWhatsapp(h.getWhatsapp());
        dto.setEmail(h.getEmail());
        dto.setWebsite(h.getWebsite());
        dto.setMapUrl(h.getMapUrl());
        dto.setDescription(h.getDescription());
        dto.setServices(h.getServices());
        dto.setActive(h.isActive());
        dto.setDoctorCount(doctorProfileRepository.countByHospitalIdsAndActive(h.getId(), true));
        return dto;
    }
}
