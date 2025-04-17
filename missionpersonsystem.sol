
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract user_register {
    enum Role {
        Admin,
        Reporter,
        Investigator
    }

    struct User {
        uint256 Nid;
        string username;
        Role role;
        string useraddress;
    }

    User[] public users;
    mapping(uint256 => bool) public isRegistered; // Tracks registered NIDs

    // --- Convert String to Enum Role ---
    function getRoleFromString(string memory _role)
        private
        pure
        returns (Role)
    {
        bytes32 roleHash = keccak256(abi.encodePacked(_role));

        if (roleHash == keccak256(abi.encodePacked("Admin"))) {
            return Role.Admin;
        } else if (roleHash == keccak256(abi.encodePacked("Reporter"))) {
            return Role.Reporter;
        } else if (roleHash == keccak256(abi.encodePacked("Investigator"))) {
            return Role.Investigator;
        } else {
            revert(
                "Invalid role input! Must be 'Admin', 'Reporter', or 'Investigator'."
            );
        }
    }

    // --- Register User (Checking NID & Role) ---
    function registerUser(
        uint256 _Nid,
        string memory _username,
        string memory _role, // Accept role as string and convert to enum
        string memory _useraddress
    ) public {
        require(!isRegistered[_Nid], "NID already registered!");
        require(_Nid > 0, "NID must be > 0");
        require(bytes(_username).length > 0, "Name cannot be empty!");
        require(bytes(_useraddress).length > 0, "Address cannot be empty!");

        Role userRole = getRoleFromString(_role); // Convert string to Role enum

        users.push(User(_Nid, _username, userRole, _useraddress));
        isRegistered[_Nid] = true; // Mark NID as registered
    }

    // --- Get total users ---
    function getTotalUsers() public view returns (uint256) {
        return users.length;
    }

    // --- Retrieve User by NID ---
    function getUserByNid(uint256 _Nid) external view returns (User memory) {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].Nid == _Nid) {
                return users[i];
            }
        }
        revert("User with given NID not found!");
    }
}

// -----------------------------------------------------------------------2nd contract-----------------------------------

contract addMissing_person {
    user_register public missing_person;


    constructor(address _contractAddress) {
        missing_person = user_register(_contractAddress);
    } //using constractor to link

    enum Status {Missing, Found}
    enum Urgency { Low, Medium, High}

    struct MissingPerson {
        uint256 caseID;
        string missing_person_name;
        uint256 missing_person_age;
        uint256 missing_person_height;
        Status status;
        string missing_person_description;
        string lastSeenLocation;
        string relativeContact;
        Urgency urgencyLevel;
        uint256 investigatorNid;
    }

    mapping(uint256 => MissingPerson) public caseDetails;
    mapping(uint256 => InvestigatorAssignment) public investigatorAssigned;
    mapping(string => uint256[]) public divisionCases;
    mapping(string => uint256) public divisionCounts;

    uint256 public caseCounter = 1;

    // Add Missing Person (Only Reporters Can Add)
    function addMissingPerson(
        uint256 _Nid,
        string memory _missing_person_name,
        uint256 _missing_person_age,
        uint256 _missing_person_height,
        string memory _missing_person_description,
        string memory _lastSeenLocation,
        string memory _relativeContact
    ) public {
        require(
            missing_person.getUserByNid(_Nid).role ==
                user_register.Role.Reporter,
            "Only Reporters can add missing persons!"
        );

        // Define urgency level
        Urgency urgencyLevel;

        if (_missing_person_age < 18) {
            urgencyLevel = Urgency.High;
        } else if (_missing_person_age > 50) {
            urgencyLevel = Urgency.Medium;
        } else {
            urgencyLevel = Urgency.Low;
        }

        MissingPerson memory newPerson = MissingPerson( // Create a new missing person entry
            caseCounter,
            _missing_person_name,
            _missing_person_age,
            _missing_person_height,
            Status.Missing,
            _missing_person_description,
            _lastSeenLocation,
            _relativeContact,
            urgencyLevel,
           0
        );

        // Store the missing person details in the caseDetails mapping
        caseDetails[caseCounter] = newPerson;

        divisionCases[_lastSeenLocation].push(caseCounter); // ✅ Store Case ID in Division Mapping
        divisionCounts[_lastSeenLocation]++;  // ✅ Increase Count for Division
        // Increase the caseCounter for the next case ID
        caseCounter = caseCounter + 1;
    }

    // Get Missing Person by Case ID
    function getMissingPerson(uint256 _caseID) external view returns (MissingPerson memory){
        return caseDetails[_caseID];
    }
    

    function updateMissingPersonStatus(uint256 _adminNid, uint256 _caseID, Status _newStatus) public {
    require(caseDetails[_caseID].caseID != 0, "Invalid Case ID: Case does not exist!");
    require(missing_person.getUserByNid(_adminNid).role == user_register.Role.Admin, "Only Admins can update status!");

        MissingPerson storage caseData = caseDetails[_caseID];

        require(caseData.status == Status.Missing, "Person is already found!");
        require(_newStatus == Status.Found, "Invalid status! Can only change to 'Found'.");

        caseData.status = _newStatus;
    }


    struct InvestigatorAssignment {
        uint256 investigatorNid;
        bool isAssigned;
    }




     function assignInvestigator(uint256 _adminNid, uint256 _caseID, uint256 _investigatorNid) public {
        // Step 1: Verify the Admin's role
        require(missing_person.isRegistered(_adminNid), "Admin NID is not registered!");
        user_register.User memory adminUser = missing_person.getUserByNid(_adminNid);
        require(adminUser.role == user_register.Role.Admin, "Only Admins can assign investigators!");

        // Step 2: Verify the Investigator's role
        require(missing_person.isRegistered(_investigatorNid), "Investigator NID is not registered!");
        user_register.User memory investigatorUser = missing_person.getUserByNid(_investigatorNid);
        require(investigatorUser.role == user_register.Role.Investigator, "Only Investigators can be assigned!");

        // Step 3: Ensure the investigator is not already assigned to the same case
        require(!investigatorAssigned[_caseID].isAssigned, "Investigator already assigned to this case!");


        // Step 4: Assign Investigator
        caseDetails[_caseID].investigatorNid = _investigatorNid;
       investigatorAssigned[_caseID] = InvestigatorAssignment(_investigatorNid, true);
}

    
// -------------------------------------------------
    
    function getMissingPersonsByDivision(string memory _division) public view returns (string[] memory) {
    uint256[] memory caseIDs = divisionCases[_division]; // Get case IDs for this division
    string[] memory names = new string[](caseIDs.length);

    for (uint256 i = 0; i < caseIDs.length; i++) {
        names[i] = caseDetails[caseIDs[i]].missing_person_name; // Get names based on case IDs
    }

    return names;
}


function getSortedMissingCounts() public view returns (string[] memory, uint256[] memory) {
    string[8] memory fixedDivisions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];
    
    string[] memory divisions = new string[](8);
    uint256[] memory counts = new uint256[](8);

    // Fill arrays with division names and counts
    for (uint256 i = 0; i < fixedDivisions.length; i++) {
        divisions[i] = fixedDivisions[i];  
        counts[i] = divisionCounts[fixedDivisions[i]];
    }

    // **Bubble Sort for Highest → Lowest**
    for (uint256 i = 0; i < counts.length; i++) {
        for (uint256 j = i + 1; j < counts.length; j++) {
            if (counts[i] < counts[j]) { // Compare and swap
                (counts[i], counts[j]) = (counts[j], counts[i]);
                (divisions[i], divisions[j]) = (divisions[j], divisions[i]);
            }
        }
    }

    return (divisions, counts); // Sorted list!
}






    struct Appointment {
    uint256 reporterNid;  // Reporter booking the appointment
    uint256 investigatorNid;
    string timeSlot;
    bool isBooked;
}

// Mapping to store booked slots for investigators
   mapping(uint256 => mapping(string => Appointment)) public bookedAppointments;

// Mapping to track Admin payments via NID
   mapping(uint256 => uint256) public balances;

   

   function bookInvestigationSlot(
    uint256 _adminNid,
    uint256 _reporterNid,
    uint256 _investigatorNid,
    string memory _timeSlot
) public payable {
    require(msg.value >= 0.01 ether, "Insufficient payment! Minimum 0.01 ETH required.");
    require(missing_person.getUserByNid(_reporterNid).role == user_register.Role.Reporter, "Only Reporters can book slots!");
    require(missing_person.getUserByNid(_investigatorNid).role == user_register.Role.Investigator, "Invalid Investigator!");
    require(missing_person.getUserByNid(_adminNid).role == user_register.Role.Admin, "Invalid Admin NID!");

    require(bookedAppointments[_investigatorNid][_timeSlot].reporterNid == 0, "Time slot already booked!");

    // ✅ Send payment to Admin
    balances[_adminNid] += msg.value;

    // ✅ Store appointment
    bookedAppointments[_investigatorNid][_timeSlot] = Appointment(_reporterNid, _investigatorNid, _timeSlot, true);
}

   function getInvestigatorSchedule(uint256 _investigatorNid) public view returns (Appointment[] memory) {
    string[6] memory predefinedSlots = ["4:00 PM-4:10 PM", "4:11 PM-4:20 PM", "4:21 PM-4:30 PM",
                                        "4:31 PM-4:40 PM", "4:41 PM-4:50 PM", "4:51 PM-5:00 PM"];

    Appointment[] memory bookedAppointmentsList = new Appointment[](6);
    uint256 index = 0;

    for (uint256 i = 0; i < predefinedSlots.length; i++) {
        // Check if this time slot is booked
        if (bookedAppointments[_investigatorNid][predefinedSlots[i]].isBooked) {
            bookedAppointmentsList[index] = bookedAppointments[_investigatorNid][predefinedSlots[i]];
            index++;
        }
    }

    return bookedAppointmentsList; // ✅ Returns full details (time slot, reporter NID, investigator NID)
}



}

 
