// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistration.sol";

contract InvestigatorAppointment {
    struct Appointment {
        uint caseId;
        address investigator;
        uint timeSlot;
        address reporter;
    }

    event AppointmentBooked(address indexed reporter, address indexed investigator, uint indexed caseId, uint timeSlot);
    event SlotAlreadyBooked(address indexed investigator, uint timeSlot);
    event UnauthorizedAccess(address indexed caller, string roleAttempted);

    UserRegistration userRegistration;
    mapping(address => Appointment[]) public investigatorAppointments;
    mapping(address => mapping(uint => bool)) public slotBooked;

    constructor(address userContract) {
        userRegistration = UserRegistration(userContract);
    }

    modifier onlyReporter() {
        string memory role = userRegistration.checkUserData(msg.sender);
        if (keccak256(bytes(role)) != keccak256(bytes("Reporter"))) {
            emit UnauthorizedAccess(msg.sender, role);
            revert("Access denied: Only reporters can book appointments");
        }
        _;
    }

    modifier onlyInvestigator() {
        string memory role = userRegistration.checkUserData(msg.sender);
        if (keccak256(bytes(role)) != keccak256(bytes("Investigator"))) {
            emit UnauthorizedAccess(msg.sender, role);
            revert("Access denied: Only investigators can view schedule");
        }
        _;
    }

    function bookAppointment(
        uint caseId,
        address investigator,
        uint timeSlot
    ) public payable onlyReporter {
        require(msg.value >= 0.01 ether, "Insufficient fee");

        if (slotBooked[investigator][timeSlot]) {
            emit SlotAlreadyBooked(investigator, timeSlot);
            revert("Time slot already booked");
        }

        slotBooked[investigator][timeSlot] = true;

        Appointment memory newAppointment = Appointment({
            caseId: caseId,
            investigator: investigator,
            timeSlot: timeSlot,
            reporter: msg.sender
        });

        investigatorAppointments[investigator].push(newAppointment);
        emit AppointmentBooked(msg.sender, investigator, caseId, timeSlot);
    }

    function getSchedule() public view onlyInvestigator returns (Appointment[] memory) {
        return investigatorAppointments[msg.sender];
    }
}
