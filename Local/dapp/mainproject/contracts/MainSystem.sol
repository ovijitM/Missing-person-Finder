// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistration.sol"; 
import "./Report.sol";
import "./InvestigatorContract.sol";  
import "./InvestigatorAppointment.sol"; 

contract MainSystem {
    UserRegistration userRegistry;  
    InvestigatorContract investigatorModule;  
    InvestigatorAppointment appointmentModule; 
    Report missingReport;  

    event CaseAssigned(uint indexed caseId, address indexed investigator);
    event AppointmentBooked(address indexed reporter, address indexed investigator, uint indexed caseId, uint timeSlot);
    event AdminAccessChecked(address indexed admin);
    event UnauthorizedAccess(address indexed caller, string roleAttempted);

    constructor(
        address userRegistryAddr,
        address reportAddr,
        address investigatorAddr,
        address appointmentAddr
    ) {
        userRegistry = UserRegistration(userRegistryAddr);  
        investigatorModule = InvestigatorContract(investigatorAddr);  
        appointmentModule = InvestigatorAppointment(appointmentAddr);  
        missingReport = Report(reportAddr);  

        userRegistry.createUser("Admin", 0, 1234567894);
    }

    modifier onlyAdmin() {
        string memory role = userRegistry.checkUserData(msg.sender);
        if (keccak256(bytes(role)) != keccak256(bytes("Admin"))) {
            emit UnauthorizedAccess(msg.sender, role);
            revert("Only Admin can perform this action");
        }
        emit AdminAccessChecked(msg.sender);
        _;
    }
    

    function assignCaseToInvestigator(uint caseId, address invAddress) public onlyAdmin {
        investigatorModule.assignInvestigator(caseId, invAddress);
        emit CaseAssigned(caseId, invAddress);
    }

    function getMissingByDivision(uint divisionId) public view returns (string memory) {
        return missingReport.getMissingByDivision(divisionId, msg.sender);
    }

    function getInvestigatorsForCase(uint caseId) public view returns (address[] memory) {
        return investigatorModule.getInvestigators(caseId);
    }

    function bookInvestigationSlot(uint caseId, address inv, uint timeSlot) public payable {
        appointmentModule.bookAppointment{value: msg.value}(caseId, inv, timeSlot);
        emit AppointmentBooked(msg.sender, inv, caseId, timeSlot);
    }

    function getMySchedule() public returns (InvestigatorAppointment.Appointment[] memory) {
        return appointmentModule.getSchedule();
    }
}
