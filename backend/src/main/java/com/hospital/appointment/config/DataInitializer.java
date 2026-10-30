package com.hospital.appointment.config;

import com.hospital.appointment.model.*;
import com.hospital.appointment.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           DoctorProfileRepository doctorProfileRepository,
                           AvailabilityRepository availabilityRepository,
                           PatientProfileRepository patientProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@hospital.lk")) {
            logger.info("Database already seeded. Skipping initial data loading.");
            return;
        }

        logger.info("Seeding Sri Lankan hospital data...");

        // 1. Create Admin
        User admin = new User("System Administrator", "admin@hospital.lk", passwordEncoder.encode("admin123"), "+94 11 234 5678", Role.ADMIN);
        userRepository.save(admin);

        // 2. Create Receptionist
        User receptionist = new User("Anura Perera", "receptionist@hospital.lk", passwordEncoder.encode("receptionist123"), "+94 11 234 5679", Role.RECEPTIONIST);
        userRepository.save(receptionist);

        // 3. Create Sample Patient
        User patient = new User("Kasun Jayawardena", "patient@hospital.lk", passwordEncoder.encode("patient123"), "+94 77 123 4567", Role.PATIENT);
        User savedPatient = userRepository.save(patient);
        PatientProfile pProfile = new PatientProfile(savedPatient.getId());
        pProfile.setNic("199012345678");
        pProfile.setGender("Male");
        pProfile.setBloodGroup("O+");
        pProfile.setEmergencyContactName("Saman Jayawardena");
        pProfile.setEmergencyContactPhone("+94 77 765 4321");
        patientProfileRepository.save(pProfile);

        // 4. Create Departments
        Department cardio = departmentRepository.save(new Department("Cardiology", "Advanced heart care services located at National Hospital Colombo.", "Heart"));
        Department neuro = departmentRepository.save(new Department("Neurology", "Comprehensive brain and spine diagnostics at General Hospital Kandy.", "Activity"));
        Department ortho = departmentRepository.save(new Department("Orthopedics", "Specialized bone and joint care at Asiri Hospital.", "Shield"));
        Department peds = departmentRepository.save(new Department("Pediatrics", "Compassionate child care at Lady Ridgeway Hospital.", "Smile"));

        // 5. Create Doctors
        createDoctor(
                "Dr. Chaminda Perera", "chaminda.perera@hospital.lk", "doctor123", "+94 11 200 1001",
                cardio.getId(), "Interventional Cardiology",
                "Senior Cardiologist with 15 years experience at National Hospital Colombo.",
                "MD, FACC, University of Colombo",
                30, BigDecimal.valueOf(3000.0), 15, "Room 302",
                "National Hospital Colombo", "Government",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
        );

        createDoctor(
                "Dr. Nilanthi Silva", "nilanthi.silva@hospital.lk", "doctor123", "+94 11 200 1002",
                neuro.getId(), "Neurology & Epilepsy",
                "Leading Neurologist serving the Central Province at General Hospital Kandy.",
                "MD, PhD, University of Peradeniya",
                30, BigDecimal.valueOf(3500.0), 12, "Room 410",
                "General Hospital Kandy", "Government",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
        );

        createDoctor(
                "Dr. Ruwan Wickramasinghe", "ruwan.wick@hospital.lk", "doctor123", "+94 11 200 1003",
                ortho.getId(), "Joint Reconstruction",
                "Top orthopedic surgeon specializing in robotic joint replacements at Asiri Hospital.",
                "DO, FAAOS, University of Colombo",
                30, BigDecimal.valueOf(5000.0), 10, "Room 205",
                "Asiri Hospital", "Private",
                "https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&q=80&w=400"
        );

        createDoctor(
                "Dr. Priyanthi Fernando", "priyanthi.f@hospital.lk", "doctor123", "+94 11 200 1004",
                peds.getId(), "Neonatal Care",
                "Specialist pediatrician focused on infant wellness at Lady Ridgeway Hospital.",
                "MD, FAAP, University of Colombo",
                30, BigDecimal.valueOf(2500.0), 11, "Room 108",
                "Lady Ridgeway Hospital", "Government",
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
        );

        logger.info("Database successfully seeded with Sri Lankan context!");
    }

    private void createDoctor(String name, String email, String password, String phone,
                              String deptId, String specialty, String bio, String qualifications,
                              int duration, BigDecimal fee, int expYears, String room, String hospitalName, String hospitalType, String imgUrl) {
        User docUser = new User(name, email, passwordEncoder.encode(password), phone, Role.DOCTOR);
        User savedUser = userRepository.save(docUser);

        DoctorProfile profile = new DoctorProfile(savedUser.getId(), deptId, specialty, qualifications, duration, fee);
        profile.setBiography(bio);
        profile.setExperienceYears(expYears);
        profile.setRoomNumber(room);
        profile.setHospitalName(hospitalName);
        profile.setHospitalType(hospitalType);
        profile.setProfileImageUrl(imgUrl);
        DoctorProfile savedProfile = doctorProfileRepository.save(profile);

        // Set standard availability Monday - Friday 09:00 - 17:00
        List<DayOfWeek> days = Arrays.asList(
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
        );
        for (DayOfWeek day : days) {
            Availability a = new Availability(
                    savedProfile.getId(),
                    day,
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    duration
            );
            availabilityRepository.save(a);
        }
    }
}
