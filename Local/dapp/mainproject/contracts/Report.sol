// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistration.sol";

contract Report {
    enum Status {Missing, Found}
    enum Priority {Low, Medium, High}

    UserRegistration public userContract;
    uint private caseCounter = 1;

    constructor(address contractAddress) {
        userContract = UserRegistration(contractAddress);
    }

    struct MissingReport {
        uint id;
        string name;
        uint age;
        uint height;
        uint status;
        uint priority;
        string description;
        uint lastSeenLocation;
        uint relativeNumber;
        address reporter;
        address investigator;
    }

    mapping(uint => MissingReport) public reports;
    uint[] public caseIds;
    mapping(uint => uint) public missingByDivision;

    string[8] public divisions = [
        "Dhaka", "Chittagong", "Khulna", "Barisal", 
        "Sylhet", "Rajshahi", "Rangpur", "Mymensingh"
    ];

    event ReportCreated(uint caseId, address indexed reporter);
    event CaseStatusUpdated(uint caseId, Status newStatus);
    event MissingCountByDivision(uint divisionId, uint count);

    modifier onlyRegistered() {
        require(userContract.checkUser(msg.sender) != 0, "Please register first");
        _;
    }

    modifier onlyAdmin() {
        string memory role = userContract.checkUserData(msg.sender);
        require(keccak256(bytes(role)) == keccak256(bytes("Admin")), "Only admin allowed");
        _;
    }

    modifier validDivision(uint _divisionId) {
        require(_divisionId < 8, "Invalid division ID");
        _;
    }

    modifier caseExists(uint caseId) {
        require(reports[caseId].id != 0, "Case not found");
        _;
    }

    function createReport(
        string memory _name,
        uint _age,
        uint _height,
        uint _status,
        string memory _description,
        uint _lastLocation,
        uint _relativeContact
    ) public onlyRegistered validDivision(_lastLocation) returns (string memory, uint) {
        require(_status == uint(Status.Missing) || _status == uint(Status.Found), "Invalid status");

        uint priorityIndex;
        if (_age < 18) {
            priorityIndex = uint(Priority.High);
        } else if (_age <= 50) {
            priorityIndex = uint(Priority.Medium);
        } else {
            priorityIndex = uint(Priority.Low);
        }

        uint currentId = caseCounter++;

        reports[currentId] = MissingReport(
            currentId,
            _name,
            _age,
            _height,
            _status,
            priorityIndex,
            _description,
            _lastLocation,
            _relativeContact,
            msg.sender,
            address(0)
        );

        if (_status == uint(Status.Missing)) {
            missingByDivision[_lastLocation]++;
        }

        caseIds.push(currentId);

        emit ReportCreated(currentId, msg.sender);
        return ("Report created successfully", currentId);
    }

    function totalCases() public view returns (uint) {
        return caseIds.length;
    }

    function updateCaseStatus(uint caseId) external onlyAdmin caseExists(caseId) returns (string memory) {
        if (reports[caseId].status == uint(Status.Missing)) {
            uint divId = reports[caseId].lastSeenLocation;
            if (missingByDivision[divId] > 0) {
                missingByDivision[divId]--;
            }
        }

        reports[caseId].status = uint(Status.Found);
        emit CaseStatusUpdated(caseId, Status.Found);
        return "Case status updated to Found";
    }

    function getMissingByDivision(uint _division, address _admin) 
        external 
        view 
        validDivision(_division) 
        returns (string memory) 
    {
        string memory role = userContract.checkUserData(_admin);
        require(keccak256(bytes(role)) == keccak256(bytes("Admin")), "Only admin can access");

        return string(
            abi.encodePacked(
                "Missing persons in ",
                divisions[_division],
                ": ",
                uint2str(missingByDivision[_division])
            )
        );
    }

    // ---------------- Utility -------------------
    function uint2str(uint _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            bstr[--k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        str = string(bstr);
    }
}
