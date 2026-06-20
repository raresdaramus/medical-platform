package com.mediconnect.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "account_id", unique = true, nullable = false)
    private UUID accountId;

    @Column(name = "license_number", unique = true, nullable = false, length = 50)
    private String licenseNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(name = "clinic_name", length = 200)
    private String clinicName;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String cui;

    @Column(name = "clinic_address", length = 300)
    private String clinicAddress;

    @Column(length = 100)
    private String cas;

    @Column(name = "cnas_contract_number", length = 50)
    private String cnasContractNumber;

    /** MF (medic de familie), AMB_SPEC (ambulatoriu de specialitate) or OTHER. */
    @Column(name = "provider_type", length = 20)
    private String providerType;

    @Column(name = "is_accepting_patients")
    private Boolean isAcceptingPatients = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Doctor() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCui() { return cui; }
    public void setCui(String cui) { this.cui = cui; }
    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
    public String getCas() { return cas; }
    public void setCas(String cas) { this.cas = cas; }
    public String getCnasContractNumber() { return cnasContractNumber; }
    public void setCnasContractNumber(String cnasContractNumber) { this.cnasContractNumber = cnasContractNumber; }
    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }
    public Boolean getIsAcceptingPatients() { return isAcceptingPatients; }
    public void setIsAcceptingPatients(Boolean isAcceptingPatients) { this.isAcceptingPatients = isAcceptingPatients; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
