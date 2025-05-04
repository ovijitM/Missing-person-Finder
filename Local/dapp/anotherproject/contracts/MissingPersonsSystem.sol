// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MissingPersonsSystem {
    enum Role { Admin, Reporter, Investigator }
    enum Status { Missing, Found }
    enum UrgencyLevel { Low, Medium, High }

    struct User {
        string name;
        uint256 nationalId;
        Role role;
        bool isRegistered;
    }

    struct MissingPerson {
        uint256 caseId;
        string name;
        uint256 age;
        uint256 height;
        Status status;
        UrgencyLevel urgency;
        string description;
        string lastSeenLocation;
        uint256 relativeContactNumber;
        address reporter;
        uint256 reportTime;
        bool isActive;
    }

    struct Appointment {
        uint256 caseId;
        address investigator;
        uint256 timeSlot;
        address reporter;
        bool completed;
        uint256 paymentAmount;
    }

    address payable public adminWallet;
    uint256 private nextCaseId = 10000;

    mapping(address => User) public users;
    mapping(uint256 => bool) private registeredNationalIds;
    address[] private registeredUsers;

    mapping(uint256 => MissingPerson) private missingPersons;
    uint256[] private allCaseIds;

    string[8] private divisions = [
        "Dhaka", "Chittagong", "Khulna", "Barisal",
        "Sylhet", "Rajshahi", "Rangpur", "Mymensingh"
    ];
    mapping(uint256 => uint256) private missingCountByDivision;

    mapping(uint256 => address[]) private caseInvestigators;
    mapping(address => Appointment[]) private investigatorAppointments;
    mapping(address => mapping(uint256 => bool)) private slotBooked;

    mapping(bytes32 => bool) public reportedHash;

    event UserRegistered(address indexed user, string name, Role role);
    event MissingPersonReported(uint256 indexed caseId, string name, string division, address reporter);
    event StatusUpdated(uint256 indexed caseId, Status newStatus);
    event InvestigatorAssigned(uint256 indexed caseId, address investigator);
    event AppointmentBooked(uint256 indexed caseId, address investigator, uint256 timeSlot, address reporter);
    event AppointmentCompleted(uint256 indexed caseId, address investigator);
    event FundsWithdrawn(address admin, uint256 amount);

    modifier onlyAdmin() {
        require(users[msg.sender].isRegistered && users[msg.sender].role == Role.Admin, "Only admin");
        _;
    }

    modifier onlyReporter() {
        require(users[msg.sender].isRegistered && users[msg.sender].role == Role.Reporter, "Only reporter");
        _;
    }

    modifier onlyInvestigator() {
        require(users[msg.sender].isRegistered && users[msg.sender].role == Role.Investigator, "Only investigator");
        _;
    }

    modifier validCase(uint256 caseId) {
        require(missingPersons[caseId].isActive, "Invalid case");
        _;
    }

    constructor() {
        adminWallet = payable(msg.sender);
        users[msg.sender] = User("Admin", 9999999999, Role.Admin, true);
        registeredNationalIds[9999999999] = true;
        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, "Admin", Role.Admin);
    }

    function registerUser(string memory _name, uint256 _roleIndex, uint256 _nationalId) public returns (string memory) {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(_roleIndex <= uint(Role.Investigator), "Invalid role");
        require(_countDigits(_nationalId) == 10, "NID must be 10 digits");
        require(!registeredNationalIds[_nationalId], "NID already exists");

        Role role = Role(_roleIndex);
        users[msg.sender] = User(_name, _nationalId, role, true);
        registeredNationalIds[_nationalId] = true;
        registeredUsers.push(msg.sender);

        emit UserRegistered(msg.sender, _name, role);
        return "User registered";
    }

    function reportMissingPerson(
        string memory _name,
        uint256 _age,
        uint256 _height,
        string memory _description,
        string memory _lastSeenLocation,
        uint256 _relativeContact
    ) public onlyReporter returns (string memory, uint256) {
        bytes32 hash = keccak256(abi.encodePacked(_name, _age, _lastSeenLocation));
        require(!reportedHash[hash], "Case already reported");
        reportedHash[hash] = true;

        UrgencyLevel urgency = _age < 18
            ? UrgencyLevel.High
            : (_age > 50 ? UrgencyLevel.Medium : UrgencyLevel.Low);

        uint256 divisionId = getDivisionId(_lastSeenLocation);
        uint256 caseId = nextCaseId++;

        missingPersons[caseId] = MissingPerson({
            caseId: caseId,
            name: _name,
            age: _age,
            height: _height,
            status: Status.Missing,
            urgency: urgency,
            description: _description,
            lastSeenLocation: _lastSeenLocation,
            relativeContactNumber: _relativeContact,
            reporter: msg.sender,
            reportTime: block.timestamp,
            isActive: true
        });

        allCaseIds.push(caseId);
        missingCountByDivision[divisionId]++;

        emit MissingPersonReported(caseId, _name, _lastSeenLocation, msg.sender);
        return ("Reported successfully", caseId);
    }

    function updatePersonStatus(uint256 caseId) public onlyAdmin validCase(caseId) returns (string memory) {
        MissingPerson storage person = missingPersons[caseId];
        require(person.status == Status.Missing, "Already found");

        uint256 divisionId = getDivisionId(person.lastSeenLocation);
        if (missingCountByDivision[divisionId] > 0) {
            missingCountByDivision[divisionId]--;
        }

        person.status = Status.Found;

        emit StatusUpdated(caseId, Status.Found);
        return "Updated to Found";
    }

    function assignInvestigator(uint256 caseId, address investigator) public onlyAdmin validCase(caseId) returns (string memory) {
        require(users[investigator].isRegistered && users[investigator].role == Role.Investigator, "Invalid investigator");

        if (_isInvestigatorAssigned(caseId, investigator)) {
            return "Already assigned";
        }

        caseInvestigators[caseId].push(investigator);
        emit InvestigatorAssigned(caseId, investigator);
        return "Investigator assigned";
    }

    function bookAppointment(uint256 caseId, address investigator, uint256 slotIndex) public payable onlyReporter validCase(caseId) {
        require(msg.value >= 0.01 ether, "0.01 ETH required");
        require(users[investigator].isRegistered && users[investigator].role == Role.Investigator, "Invalid investigator");
        require(slotIndex < 60, "Invalid slot");
        require(!slotBooked[investigator][slotIndex], "Slot taken");
        require(missingPersons[caseId].reporter == msg.sender, "Not your case");
        require(_isInvestigatorAssigned(caseId, investigator), "Investigator not assigned");

        slotBooked[investigator][slotIndex] = true;
        investigatorAppointments[investigator].push(Appointment(caseId, investigator, slotIndex, msg.sender, false, msg.value));

        _sendAdmin(msg.value);

        emit AppointmentBooked(caseId, investigator, slotIndex, msg.sender);
    }

    function getCaseDetails(uint256 caseId) public view validCase(caseId) returns (MissingPerson memory) {
        return missingPersons[caseId];
    }

    function getAllCaseIds() public view returns (uint256[] memory) {
        return allCaseIds;
    }

    function getCaseIds(uint256 start, uint256 count) public view returns (uint256[] memory) {
        uint256 len = allCaseIds.length;

        uint256[] memory arr;

        if (start >= len) {
            return arr;
        }
        uint256 end = start + count > len ? len : start + count;
        uint256[] memory ids = new uint256[](end - start);

        for (uint256 i = start; i < end; i++) {
            ids[i - start] = allCaseIds[i];
        }
        return ids;
    }

    function getCaseUrgencyLevel(uint256 caseId) public view validCase(caseId) returns (string memory) {
        UrgencyLevel level = missingPersons[caseId].urgency;
        if (level == UrgencyLevel.High) return "High";
        if (level == UrgencyLevel.Medium) return "Medium";
        return "Low";
    }

    function getMissingPersonsByDivision(uint256 divisionId) public view returns (uint256[] memory) {
        uint256 count;
        for (uint256 i = 0; i < allCaseIds.length; i++) {
            uint256 id = allCaseIds[i];
            MissingPerson memory p = missingPersons[id];
            if (getDivisionId(p.lastSeenLocation) == divisionId && p.status == Status.Missing && p.isActive) count++;
        }

        uint256[] memory results = new uint256[](count);
        uint256 idx;
        for (uint256 i = 0; i < allCaseIds.length; i++) {
            uint256 id = allCaseIds[i];
            MissingPerson memory p = missingPersons[id];
            if (getDivisionId(p.lastSeenLocation) == divisionId && p.status == Status.Missing && p.isActive) {
                results[idx++] = id;
            }
        }

        return results;
    }

    function getMissingCountForDivision(uint256 id) public view returns (string memory, uint256) {
        require(id < divisions.length, "Invalid division ID");
        return (divisions[id], missingCountByDivision[id]);
    }

    function getAllDivisionWiseMissingCounts() external view returns (string[] memory divisionStats) {
        divisionStats = new string[](divisions.length);
        for (uint256 i = 0; i < divisions.length; i++) {
            uint256 count = missingCountByDivision[i];
            divisionStats[i] = string(abi.encodePacked(divisions[i], ": ", uint2str(count)));
        }
    }

    function getDivisionId(string memory divisionName) public view returns (uint256) {
        for (uint256 i = 0; i < divisions.length; i++) {
            if (keccak256(bytes(divisions[i])) == keccak256(bytes(divisionName))) {
                return i;
            }
        }
        revert("Invalid division name");
    }

    function getTimeSlotString(uint256 index) public pure returns (string memory) {
        uint256 startHour = 16 + (index * 10) / 60;
        uint256 startMin = (index * 10) % 60;
        uint256 endHour = 16 + ((index * 10 + 10) / 60);
        uint256 endMin = (index * 10 + 10) % 60;

        return string(abi.encodePacked("Slot ", uint2str(index + 1), ": ", formatTime(startHour, startMin), " - ", formatTime(endHour, endMin)));
    }

    function getInvestigatorSchedule(address investigator) public view returns (Appointment[] memory) {
        require(users[investigator].isRegistered && users[investigator].role == Role.Investigator, "Invalid investigator");

        bool isAuthorized = msg.sender == investigator;
        for (uint256 i = 0; i < allCaseIds.length && !isAuthorized; i++) {
            uint256 caseId = allCaseIds[i];
            if (missingPersons[caseId].reporter == msg.sender) {
                if (_isInvestigatorAssigned(caseId, investigator)) {
                    isAuthorized = true;
                    break;
                }
            }
        }
        require(isAuthorized, "Not authorized to view this schedule");
        return investigatorAppointments[investigator];
    }

    function mySchedule() external view onlyInvestigator returns (Appointment[] memory) {
        return investigatorAppointments[msg.sender];
    }

    function myFormattedSchedule() external view onlyInvestigator returns (string[] memory) {
        Appointment[] memory appts = investigatorAppointments[msg.sender];
        string[] memory result = new string[](appts.length);

        for (uint256 i = 0; i < appts.length; i++) {
            result[i] = string(abi.encodePacked(
                "Case #", uint2str(appts[i].caseId),
                " with ", users[appts[i].reporter].name,
                " at ", getTimeSlotString(appts[i].timeSlot),
                appts[i].completed ? " (Done)" : " (Pending)"
            ));
        }
        return result;
    }

    function getAvailableSlots(address investigator) public view returns (bool[60] memory available) {
        require(users[investigator].isRegistered && users[investigator].role == Role.Investigator, "Invalid investigator");

        bool isAuthorized = msg.sender == investigator;
        for (uint256 i = 0; i < allCaseIds.length && !isAuthorized; i++) {
            uint256 caseId = allCaseIds[i];
            if (missingPersons[caseId].reporter == msg.sender) {
                if (_isInvestigatorAssigned(caseId, investigator)) {
                    isAuthorized = true;
                    break;
                }
            }
        }
        require(isAuthorized, "Not authorized to view available slots");

        for (uint256 i = 0; i < 60; i++) {
            available[i] = !slotBooked[investigator][i];
        }
    }

    function withdrawFunds() public onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        _sendAdmin(balance);
        emit FundsWithdrawn(msg.sender, balance);
    }

    // ========== INTERNAL HELPERS ==========

    function _isInvestigatorAssigned(uint256 caseId, address investigator) internal view returns (bool) {
        address[] storage list = caseInvestigators[caseId];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == investigator) return true;
        }
        return false;
    }

    function _sendAdmin(uint256 amount) internal {
        (bool sent, ) = adminWallet.call{value: amount}("");
        require(sent, "Admin fee failed");
    }

    function _countDigits(uint256 n) internal pure returns (uint256) {
        uint256 c;
        do {
            c++;
            n /= 10;
        } while (n != 0);
        return c;
    }

    function uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 digits;
        uint256 tmp = v;
        while (tmp != 0) {
            digits++;
            tmp /= 10;
        }
        bytes memory b = new bytes(digits);
        while (v != 0) {
            digits -= 1;
            b[digits] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        return string(b);
    }

    function formatTime(uint256 h, uint256 m) internal pure returns (string memory) {
        string memory hh = h < 10 ? string(abi.encodePacked("0", uint2str(h))) : uint2str(h);
        string memory mm = m < 10 ? string(abi.encodePacked("0", uint2str(m))) : uint2str(m);
        return string(abi.encodePacked(hh, ":", mm));
    }
}
