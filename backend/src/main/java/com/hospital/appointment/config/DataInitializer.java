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
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           DoctorProfileRepository doctorProfileRepository,
                           AvailabilityRepository availabilityRepository,
                           PatientProfileRepository patientProfileRepository,
                           HospitalRepository hospitalRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.hospitalRepository = hospitalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@hospital.lk")) {
            logger.info("Database already seeded. Skipping initial data loading.");
        } else {
            seedCoreData();
        }
        // Added after the initial release, so these also run on already-seeded databases
        seedHospitals();
        seedBatticaloaDoctors();
        linkDoctorsToHospitals();
    }

    // Hospitals East Care Point takes reservations for. Contact details are from each hospital's
    // public website or listing; missing details (phone etc.) can be filled in by an admin.
    private void seedHospitals() {
        Hospital ems = new Hospital("EMS Hospital", "Hospital", "Private", "121, New Kalmunai Road, Kallady", "Batticaloa");
        ems.setPhone("+94 65 222 8800");
        ems.setWhatsapp("+94 70 667 7119");
        ems.setWebsite("https://www.emshospital.lk/");
        ems.setMapUrl("https://www.google.com/maps/search/?api=1&query=EMS+Hospital+Kallady+Batticaloa");
        ems.setDescription("Private hospital in Kallady, Batticaloa, with 24/7 service.");
        ems.setServices(List.of("Cardiology", "IVF / IUI", "Neurology", "Channelling"));
        createHospitalIfMissing(ems);

        Hospital pioneer = new Hospital("New Pioneer Hospital", "Hospital", "Private", "91, Pioneer Road", "Batticaloa");
        pioneer.setPhone("+94 65 492 9282");
        pioneer.setEmail("nphbatti009@gmail.com");
        pioneer.setWebsite("https://newpioneerhospital.com/");
        pioneer.setMapUrl("https://www.google.com/maps/search/?api=1&query=New+Pioneer+Hospital+Batticaloa");
        pioneer.setDescription("Private hospital on Pioneer Road, Batticaloa. Emergency line: 077 688 0897.");
        pioneer.setServices(List.of("Channelling", "Emergency"));
        createHospitalIfMissing(pioneer);

        Hospital gv = new Hospital("GV Hospital", "Hospital", "Private", "New Kalmunai Road", "Batticaloa");
        gv.setMapUrl("https://maps.app.goo.gl/pLgY5eccCRFQ8ozUA");
        gv.setDescription("Private hospital on New Kalmunai Road, Batticaloa.");
        gv.setServices(List.of("Channelling"));
        createHospitalIfMissing(gv);

        Hospital smiles = new Hospital("Designer Smiles", "Dental Clinic", "Private", "Batticaloa", "Batticaloa");
        smiles.setMapUrl("https://maps.app.goo.gl/jc9qf59rhr46rjRU7");
        smiles.setDescription("Dental clinic in Batticaloa.");
        smiles.setServices(List.of("Dental Care"));
        createHospitalIfMissing(smiles);

        Hospital thb = new Hospital(THB, "Teaching Hospital", "Government", "Teaching Hospital", "Batticaloa");
        thb.setMapUrl("https://www.google.com/maps/search/?api=1&query=Teaching+Hospital+Batticaloa");
        thb.setDescription("Government teaching hospital for the Batticaloa district.");
        // Kept for the doctors' records but hidden from the website: patients book through the 4 private hospitals
        thb.setActive(false);
        thb.setServices(List.of("General OPD", "General Medicine", "Paediatrics", "Cardiology", "Dermatology",
                "Gastroenterology", "Psychiatry", "General Surgery", "Orthopaedics", "Dental Surgery"));
        createHospitalIfMissing(thb);
    }

    private void createHospitalIfMissing(Hospital hospital) {
        if (hospitalRepository.findByName(hospital.getName()).isEmpty()) {
            logger.info("Adding hospital {}", hospital.getName());
            hospitalRepository.save(hospital);
        }
    }

    // Older records keep a single hospitalId or only a hospital name; move them into the hospitalIds list
    private void linkDoctorsToHospitals() {
        for (DoctorProfile profile : doctorProfileRepository.findAll()) {
            if (!profile.getHospitalIds().isEmpty()) continue;
            String hospitalId = profile.getHospitalId();
            if (hospitalId == null && profile.getHospitalName() != null) {
                hospitalId = hospitalRepository.findByName(profile.getHospitalName()).map(Hospital::getId).orElse(null);
            }
            if (hospitalId != null && hospitalRepository.existsById(hospitalId)) {
                profile.setHospitalIds(new java.util.ArrayList<>(List.of(hospitalId)));
                profile.setHospitalId(null);
                doctorProfileRepository.save(profile);
            }
        }
    }

    private void seedCoreData() {
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
        departmentRepository.save(new Department("Cardiology", "Heart and blood vessel care.", "Heart"));
        departmentRepository.save(new Department("Neurology", "Brain, spine and nerve conditions.", "Activity"));
        departmentRepository.save(new Department("Orthopaedics", "Specialised bone and joint care.", "Shield"));
        departmentRepository.save(new Department("Paediatrics", "Compassionate child care.", "Smile"));

        logger.info("Database successfully seeded with Sri Lankan context!");
    }

    // Doctors of the Batticaloa Medical Association council (source: bma.lk/president-council.php),
    // added with the hospital's agreement. Names, roles, qualifications and affiliations come from that page;
    // photos are stored in frontend/public/doctors.
    // PLACEHOLDER: consultation fees, slot lengths and clinic days/times are not published and must be
    // confirmed by the hospital (admins can edit fees in Doctor Management).
    private static final List<DayOfWeek> MON_WED_FRI = List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY);
    private static final List<DayOfWeek> TUE_THU_SAT = List.of(DayOfWeek.TUESDAY, DayOfWeek.THURSDAY, DayOfWeek.SATURDAY);
    private static final List<DayOfWeek> WEEKDAYS = List.of(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);
    private static final String THB = "Teaching Hospital Batticaloa";
    private static final String BMA_PHONE = "+94 65 222 7312";

    private void seedBatticaloaDoctors() {
        Department opd = findOrCreateDepartment("General OPD", "Outpatient consultations with Medical Officers at Teaching Hospital Batticaloa.", "Stethoscope");
        Department medicine = findOrCreateDepartment("General Medicine", "Adult medical care, diabetes and hypertension clinics.", "Stethoscope");
        Department peds = findOrCreateDepartment("Paediatrics", "Compassionate child care.", "Smile");
        Department cardio = findOrCreateDepartment("Cardiology", "Advanced heart care services.", "Heart");
        Department derm = findOrCreateDepartment("Dermatology", "Skin, hair and nail conditions, including allergy and eczema clinics.", "Fingerprint");
        Department gastro = findOrCreateDepartment("Gastroenterology", "Digestive and liver disease care.", "Pill");
        Department psych = findOrCreateDepartment("Psychiatry", "Mental health assessment and follow-up care.", "BrainCircuit");
        Department surgery = findOrCreateDepartment("General Surgery", "Consultation for general surgical conditions.", "Scissors");
        Department ortho = findOrCreateDepartment("Orthopaedics", "Specialised bone and joint care.", "Shield");
        Department dental = findOrCreateDepartment("Dental Surgery", "Oral health and dental care.", "Smile");
        Department micro = findOrCreateDepartment("Microbiology", "Infection diagnosis, culture reports and antibiotic advice.", "Microscope");
        Department histo = findOrCreateDepartment("Histopathology", "Tissue and biopsy diagnosis and report review.", "Microscope");
        Department anaes = findOrCreateDepartment("Anaesthesiology", "Pre-operative assessment and pain management.", "Syringe");

        LocalTime am = LocalTime.of(8, 0), noon = LocalTime.of(12, 0), pm = LocalTime.of(16, 0), eve = LocalTime.of(20, 0);
        BigDecimal consultant = BigDecimal.valueOf(3000.0), registrar = BigDecimal.valueOf(1500.0),
                medicalOfficer = BigDecimal.valueOf(1000.0), dentist = BigDecimal.valueOf(1500.0);

        bma("Prof. V. Thirukumar", "thirukumar.v", peds, "Professor in Paediatrics; Hon. Consultant Paediatrician",
                "Professor in Paediatrics, Dept. of Clinical Sciences, FHCS, Eastern University Sri Lanka. President, Batticaloa Medical Association.",
                "MBBS, MD (Paed), DCH (SL), FRCPCH (UK), FRCP (Lon), FRCP (Edin), FCP (USA), FSLCPaed (SL)",
                consultant, 20, THB, "viji.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. M. Murugamoorthy", "murugamoorthy.m", medicine, "Consultant Physician",
                "Consultant Physician. President Elect, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 20, THB, "murugamoorthy.jpg", MON_WED_FRI, pm, eve);
        bma("Dr. Vaithehi Rajeevan Francis", "vaithehi.f", micro, "Senior Lecturer in Microbiology; Hon. Consultant Microbiologist",
                "Senior Lecturer in Microbiology, FHCS, Eastern University Sri Lanka. Vice President, Batticaloa Medical Association.",
                "MBBS, MD (SL)", consultant, 20, THB, "francis.jpg", MON_WED_FRI, am, noon);
        bma("Dr. K. Aathithya", "aathithya.k", opd, "Medical Officer",
                "Medical Officer. Secretary, Batticaloa Medical Association.",
                "MBBS (SL)", medicalOfficer, 15, THB, "aathithya.jpg", WEEKDAYS, am, noon);
        bma("Dr. V. Mathushikaa", "mathushikaa.v", opd, "Medical Officer",
                "Medical Officer. Assistant Secretary, Batticaloa Medical Association.",
                "MBBS (SL)", medicalOfficer, 15, THB, "mathushikaa.jpg", WEEKDAYS, am, noon);
        bma("Dr. N. Thamilvannan", "thamilvannan.n", derm, "Consultant Dermatologist",
                "Consultant Dermatologist. Treasurer, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 20, THB, "thamilvannan.jpg", MON_WED_FRI, pm, eve);
        bma("Dr. K. Kasthuriye", "kasthuriye.k", opd, "Medical Officer",
                "Medical Officer. Assistant Treasurer, Batticaloa Medical Association.",
                "MBBS (Jaffna)", medicalOfficer, 15, THB, "kasthuriye.jpg", WEEKDAYS, am, noon);
        bma("Dr. Angela Arulpragasam Anthony", "angela.a", peds, "Senior Lecturer in Paediatrics; Hon. Consultant Paediatrician",
                "Senior Lecturer in Paediatrics, FHCS, Eastern University Sri Lanka. Chief Editor, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 20, THB, "angela.jpg", MON_WED_FRI, pm, eve);
        bma("Dr. George Rajeevan Francis", "rajeevan.f", cardio, "Senior Lecturer in Medicine; Hon. Consultant Cardiologist",
                "Senior Lecturer in Medicine, FHCS, Eastern University Sri Lanka. Editorial Board, Batticaloa Medical Association.",
                "MBBS, MD (SL)", consultant, 30, THB, "rajeevan.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. Thanushah Balendran", "thanushah.b", derm, "Consultant Dermatologist",
                "Consultant Dermatologist. Editorial Board, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL), MRCP (UK), SCE Dermatology (UK)", consultant, 20, THB, "thanushah.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. Melorin Vincent", "melorin.v", dental, "Dental Surgeon (Medical Officer)",
                "Dental Medical Officer. Editorial Board, Batticaloa Medical Association.",
                "BDS (SL)", dentist, 20, THB, "vincent.jpg", WEEKDAYS, am, noon);
        bma("Dr. P. Mayurathan", "mayurathan.p", medicine, "Senior Lecturer in Medicine; Hon. Consultant Physician",
                "Senior Lecturer in Medicine, FHCS, Eastern University Sri Lanka. CME Co-ordinator, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL), MRCP (UK), FRCP (London), FRCP (Edinburgh)", consultant, 20, THB, "mayurathan.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. V. Vijitharan", "vijitharan.v", gastro, "Consultant Gastroenterologist & Hepatologist",
                "Consultant Gastroenterologist and Hepatologist. CME Co-ordinator, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 30, THB, "vijitharan.jpg", MON_WED_FRI, pm, eve);
        bma("Dr. J. Nicholson", "nicholson.j", medicine, "Registrar in Medicine",
                "Registrar in Medicine. Assistant CME Co-ordinator, Batticaloa Medical Association.",
                "MBBS (SL)", registrar, 15, THB, "nicholson.jpg", WEEKDAYS, am, noon);
        bma("Dr. Sinnathurai Ahilan", "ahilan.s", histo, "Consultant Histopathologist",
                "Consultant Histopathologist. Social Secretary, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 20, THB, "ahilan.jpg", MON_WED_FRI, am, noon);
        bma("Dr. S. Sutharsan", "sutharsan.s", ortho, "Consultant Orthopaedic Surgeon",
                "Consultant Orthopaedic Surgeon. Social Secretary, Batticaloa Medical Association.",
                "MBBS (SL), MS (SL)", consultant, 20, THB, "sutharsan.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. K. Muralitharan", "muralitharan.k", dental, "Regional Dental Surgeon",
                "Regional Dental Surgeon, RDHS Batticaloa. Regional Coordinator, Batticaloa Medical Association.",
                "BDS (SL), CEMBA (OUSL), MAAID (USA), Cert. FGDP (UK)", dentist, 20,
                "Regional Director of Health Services, Batticaloa", "muralitharan.jpg", TUE_THU_SAT, am, noon);
        bma("Dr. Rajaratnam Kamalraj", "kamalraj.r", psych, "Acting Consultant Psychiatrist",
                "Acting Consultant Psychiatrist. Librarian, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 30, THB, "kamalraj.jpg", MON_WED_FRI, am, noon);
        bma("Dr. F. Zainab Razeen", "razeen.z", peds, "Senior Registrar in Paediatrics",
                "Senior Registrar in Paediatrics. Assistant Librarian, Batticaloa Medical Association.",
                "MBBS (SL), DCH, MD (SL)", registrar, 15, THB, "razeen.jpg", WEEKDAYS, am, noon);
        bma("Dr. Peethambaram Jeepara", "jeepara.p", surgery, "Consultant General Surgeon",
                "Consultant General Surgeon. Internal Audit, Batticaloa Medical Association.",
                "MBBS (SL), MS (SL), FRCS, FCSSL", consultant, 20, null, "peethambaram.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. V.S. Thevacumar", "thevacumar.v", anaes, "Consultant Anaesthetist",
                "Consultant Anaesthetist. Council Member, Batticaloa Medical Association.",
                "MBBS (SL), MD (SL)", consultant, 20, THB, "thevacumar.jpg", MON_WED_FRI, am, noon);
        bma("Dr. B. Devakanthan", "devakanthan.b", micro, "Consultant Clinical Microbiologist",
                "Consultant Clinical Microbiologist. Council Member, Batticaloa Medical Association.",
                "MBBS (SL), Dip, MD (SL)", consultant, 20, THB, "devakanthan.jpg", TUE_THU_SAT, am, noon);
        bma("Dr. T. Ketheesan", "ketheesan.t", dental, "Dental Surgeon",
                "Dental Surgeon. Council Member, Batticaloa Medical Association.",
                "BDS (SL), MAAID (USA)", dentist, 20, THB, "ketheesan.jpg", MON_WED_FRI, pm, eve);
        bma("Dr. S. Livitan", "livitan.s", dental, "Dental Surgeon",
                "Dental Surgeon. Council Member, Batticaloa Medical Association.",
                "BDS (SL), PGD in HQPS (SL), LLB (OUSL)", dentist, 20, THB, "livitan.jpg", TUE_THU_SAT, pm, eve);
        bma("Dr. K. Janani", "janani.k", opd, "Medical Officer",
                "Medical Officer. Council Member, Batticaloa Medical Association.",
                "MBBS (SL)", medicalOfficer, 15, THB, "janani.jpg", WEEKDAYS, am, noon);
    }

    private void bma(String name, String emailLocal, Department dept, String specialty, String bio, String qualifications,
                     BigDecimal fee, int slotMinutes, String hospital, String photo,
                     List<DayOfWeek> days, LocalTime start, LocalTime end) {
        // Experience years are not published, so 0 (the UI hides it); no room assigned yet
        createDoctorIfMissing(name, emailLocal + "@hospital.lk", BMA_PHONE, dept.getId(), specialty, bio, qualifications,
                slotMinutes, fee, 0, null, hospital, hospital == null ? null : "Government",
                "/doctors/" + photo, days, start, end);
    }

    private Department findOrCreateDepartment(String name, String description, String icon) {
        // Tolerates duplicate department names left by older seeds (findByName would throw)
        return departmentRepository.findAll().stream()
                .filter(d -> name.equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElseGet(() -> departmentRepository.save(new Department(name, description, icon)));
    }

    private void createDoctorIfMissing(String name, String email, String phone,
                                       String deptId, String specialty, String bio, String qualifications,
                                       int duration, BigDecimal fee, int expYears, String room, String hospitalName, String hospitalType,
                                       String imgUrl, List<DayOfWeek> days, LocalTime start, LocalTime end) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        logger.info("Adding doctor {}", name);
        createDoctor(name, email, "doctor123", phone, deptId, specialty, bio, qualifications,
                duration, fee, expYears, room, hospitalName, hospitalType, imgUrl, days, start, end);
    }

    private void createDoctor(String name, String email, String password, String phone,
                              String deptId, String specialty, String bio, String qualifications,
                              int duration, BigDecimal fee, int expYears, String room, String hospitalName, String hospitalType, String imgUrl) {
        createDoctor(name, email, password, phone, deptId, specialty, bio, qualifications, duration, fee, expYears,
                room, hospitalName, hospitalType, imgUrl, WEEKDAYS, LocalTime.of(9, 0), LocalTime.of(17, 0));
    }

    private void createDoctor(String name, String email, String password, String phone,
                              String deptId, String specialty, String bio, String qualifications,
                              int duration, BigDecimal fee, int expYears, String room, String hospitalName, String hospitalType,
                              String imgUrl, List<DayOfWeek> days, LocalTime start, LocalTime end) {
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

        for (DayOfWeek day : days) {
            Availability a = new Availability(
                    savedProfile.getId(),
                    day,
                    start,
                    end,
                    duration
            );
            availabilityRepository.save(a);
        }
    }
}
