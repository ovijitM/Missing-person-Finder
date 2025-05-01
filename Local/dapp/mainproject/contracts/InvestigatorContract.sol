// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistration.sol";
import "./Report.sol";

contract InvestigatorContract {
    UserRegistration userRegistration;
    Report report;

  
    event InvestigatorAssigned(address indexed assignedBy, uint indexed caseId, address indexed investigator);
    event InvestigatorAlreadyAssigned(uint indexed caseId, address investigator);
    event UnauthorizedAccess(address indexed caller, string roleAttempted);

   
    constructor(address userRegistrationAddress, address reportAddress) {
        userRegistration = UserRegistration(userRegistrationAddress);
        report = Report(reportAddress);
    }

    
    mapping(uint => address[]) private caseInvestigators;

   
    modifier onlyAdmin() {
        string memory role = userRegistration.checkUserData(msg.sender);
        if (keccak256(bytes(role)) != keccak256(bytes("Admin"))) {
            emit UnauthorizedAccess(msg.sender, role);
            revert("Access denied: Admin only");
        }
        _;
    }

    
    function assignInvestigator(uint caseId, address investigator) external onlyAdmin returns (string memory) {
        address[] storage assignedInvestigators = caseInvestigators[caseId];

        
        for (uint i = 0; i < assignedInvestigators.length; i++) {
            if (assignedInvestigators[i] == investigator) {
                emit InvestigatorAlreadyAssigned(caseId, investigator);
                revert("Investigator already assigned");
            }
        }

       
        assignedInvestigators.push(investigator);
        emit InvestigatorAssigned(msg.sender, caseId, investigator);
        return "Investigator assigned successfully";
    }

  
    function getInvestigators(uint caseId) external view returns (address[] memory) {
        return caseInvestigators[caseId];
    }
}
