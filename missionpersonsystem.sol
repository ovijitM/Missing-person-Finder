// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract user_register {
    enum Role {
        Admin,
        Reporter,
        Investigator
    }

    struct User {
        uint Nid;
        string username;
        Role role;
        string useraddress;
        address userethaddress;
    }

    User[] public users;
    mapping(uint => bool) public is_registered; // Tracks registered NIDs

   address[] public add;


    function get_roles(string memory _role) private pure returns (Role)
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

   
    function registerUser(
        uint _Nid,
        string memory _username,
        string memory _role, // Accept role as string and convert to enum
        string memory _useraddress
    ) public {
        for (uint i = 0; i < add.length; i++) {
        if (msg.sender == add[i]) {
            revert("You already registered with this address!");
        }
    }



        require(!is_registered[_Nid], "NID already registered!");


        Role userrole = get_roles(_role); // Convert string to Role enum

        users.push(User(_Nid, _username, userrole, _useraddress, msg.sender));
        add.push(msg.sender);
        is_registered[_Nid] = true; 
    }

  
    function get_totalusers() public view returns (uint) {
        return users.length;
    }

 
    function get_user_Nid(uint _Nid) external view returns (User memory) {
        for (uint i = 0; i < users.length; i++) {
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
    enum Urgency { Low,Medium,High}

    struct missingPerson {
        uint caseID;
        string missing_person_name;
        uint missing_person_age;
        uint missing_person_height;
        Status status;
        string missing_person_description;
        string lastSeenLocation;
        string relativeContact;
        Urgency u_evel;
        uint investigator_nid;
    }

    mapping(uint =>missingPerson) public casse_details;





    mapping(uint =>Investigator_assignment) public investigator_assigned;

    mapping(string =>uint[]) public division_Cases;


    mapping(string =>uint) public divisioncounts;

    uint public case_counter =1;





    // Add Missing Person 
    function addmissingPerson(
        uint _Nid,
        string memory _missing_person_name,
        uint _missing_person_age,
        uint _missing_person_height,
        string memory _missing_person_description,
        string memory _lastSeenLocation,
        string memory _relativeContact
    ) public {
        require(
            missing_person.get_user_Nid(_Nid).role==
                user_register.Role.Reporter,
            "Only Reporters can add missing persons!"
        );

        // Define urgency level
        Urgency u_evel;

        if (_missing_person_age < 18) {
            u_evel = Urgency.High;
        } else if (_missing_person_age > 50) {
            u_evel = Urgency.Medium;
        } else {
            u_evel = Urgency.Low;
        }

        missingPerson memory newPerson = missingPerson( // Create a new missing person entry
            case_counter,
            _missing_person_name,
            _missing_person_age,
            _missing_person_height,
            Status.Missing,
            _missing_person_description,
            _lastSeenLocation,
            _relativeContact,
            u_evel,
           0
        );

       
        casse_details[case_counter]= newPerson;

        division_Cases[_lastSeenLocation].push(case_counter); 


        divisioncounts[_lastSeenLocation]++;  
       
        case_counter = case_counter+1;
    }

    function getmissingPerson(uint _caseID) external view returns (missingPerson memory){
        return casse_details[_caseID];
    }
    

    function update_Status(uint _adminNid,uint _caseID, Status _newstatus) public {




    require(casse_details[_caseID].caseID !=0, "Invalid Case ID: Case does not exist!");




    require(missing_person.get_user_Nid(_adminNid).role == user_register.Role.Admin, "Only Admins can update status!");

        missingPerson storage caseData=casse_details[_caseID];

        require(caseData.status == Status.Missing, "Person is already found!");



        require(_newstatus==Status.Found, "Invalid status! Can only change to 'Found'.");

        caseData.status = _newstatus;
    }


    struct Investigator_assignment {
        uint investigator_nid;
        bool isAssigned;
    }


// --------------------------------------------------------------------------------------

     function assigning_Investigator(uint _adminNid, uint _caseID, uint _investigator_nid) public {
    
        require(missing_person.is_registered(_adminNid), "Admin NID is not registered!");

        user_register.User memory adminUser = missing_person.get_user_Nid(_adminNid);




        require(adminUser.role ==user_register.Role.Admin, "Only Admins can assign investigators!");

       
        require(missing_person.is_registered(_investigator_nid), "Investigator NID is not registered!");

        user_register.User memory investigatorUser = missing_person.get_user_Nid(_investigator_nid);





        require(investigatorUser.role ==user_register.Role.Investigator, "Only Investigators can be assigned!");

        require(!investigator_assigned[_caseID].isAssigned, "Investigator already assigned to this case!");


        //  Investigator
        casse_details[_caseID].investigator_nid = _investigator_nid;
       investigator_assigned[_caseID] = Investigator_assignment(_investigator_nid, true);
}

    
// -------------------------------------------------------------------------------------------------------------------


    
    function getmissing_Division(string memory _division) public view returns (string[] memory) {
    uint[] memory caseIDs =division_Cases[_division]; 
    
    
 
    string[] memory names =new string[](caseIDs.length);

    for (uint i =0;i<caseIDs.length; i++) {



        names[i] =casse_details[caseIDs[i]].missing_person_name; // names based on case IDs
    }

    return names;
}


function get_missingCounts() public view returns (string[] memory,uint[] memory) {

    string[8] memory f_division =["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];
    
    string[] memory divisions =new string[](8);


    uint[] memory counts= new uint[](8);

    
    for (uint i= 0;i<f_division.length; i++) {



        divisions[i] =f_division[i];  


        counts[i] = divisioncounts[f_division[i]];
    }

   
    for (uint i= 0;i<counts.length; i++) {  //  Highest → Lowest
        for (uint j =i+1; j< counts.length; j++) {
            if (counts[i] < counts[j]) { // Compare and swap
                (counts[i], counts[j])= (counts[j], counts[i]);
                (divisions[i], divisions[j])=(divisions[j], divisions[i]);
            }
        }
    }

    return (divisions,counts); // Sorted list!
}






    struct appointment {
    uint reporterNid;  // Reporter booking the appointment
    uint investigator_nid;
    string timeSlot;
    bool Booked;
}


   mapping(uint =>mapping(string=>appointment)) public book_appointment;


   mapping(uint => uint) public balances;

   

   function bookinvestigationslot(


    uint _adminNid,
    uint _reporterNid,
    uint _investigator_nid,
    string memory _timeSlot


) public payable {
    require(msg.value >= 0.01 ether, "Insufficient payment! Minimum 0.01 ETH required.");
    require(missing_person.get_user_Nid(_reporterNid).role == user_register.Role.Reporter, "Only Reporters can book slots!");




    require(missing_person.get_user_Nid(_investigator_nid).role ==user_register.Role.Investigator, "Invalid Investigator!");



    require(missing_person.get_user_Nid(_adminNid).role== user_register.Role.Admin,"Invalid Admin NID!");

    require(book_appointment[_investigator_nid][_timeSlot].reporterNid ==0, "Time slot already booked!");

    
    balances[_adminNid] +=msg.value;

  
    book_appointment[_investigator_nid][_timeSlot]=appointment(_reporterNid, _investigator_nid, _timeSlot, true);
}

   function getInvestigatorSchedule(uint _investigator_nid) public view returns (appointment[] memory) {


    string[6] memory predefinedSlots = ["4:00 PM-4:10 PM","4:11 PM-4:20 PM","4:21 PM-4:30 PM",
                                        "4:31 PM-4:40 PM","4:41 PM-4:50 PM","4:51 PM-5:00 PM"];

    appointment[] memory book_appointmentList =new appointment[](6);
    uint index = 0;

    for (uint i = 0; i < predefinedSlots.length; i++) {


        // Check time slot is booked
        if (book_appointment[_investigator_nid][predefinedSlots[i]].Booked) {

            book_appointmentList[index] =book_appointment[_investigator_nid][predefinedSlots[i]];

            index++;
        }
    }

    return book_appointmentList; //  Returns full details 
}



}

 
