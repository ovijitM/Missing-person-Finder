// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistration {
    enum Role {Admin, Reporter, Investigator}

    struct User {
        string name;
        uint NID;
        Role role;
        address userAddress;
    }

    mapping(address => User) private users;
    uint[] private nids;

   
    event UserCreated(address indexed user, string name, Role role, uint NID);
    event UserChecked(address indexed user, Role role);

   
    modifier onlyUnregistered() {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        _;
    }



    modifier uniqueNID(uint NID) {
        for (uint i = 0; i < nids.length; i++) {
            require(nids[i] != NID, "NID already exists");
        }
        _;
    }

    function createUser(string memory _name, uint role, uint NID)
        public
        onlyUnregistered
        uniqueNID(NID)
        returns (string memory)
    {
        require(role <= uint(Role.Investigator), "Invalid role index");

        Role userRole = Role(role);
        users[msg.sender] = User(_name, NID, userRole, msg.sender);
        nids.push(NID);

        emit UserCreated(msg.sender, _name, userRole, NID);
        return "User created successfully";
    }

    function checkUserData(address user) external view returns (string memory) {
        require(users[user].userAddress != address(0), "User not found");

        Role r = users[user].role;

        if (r == Role.Admin) return "Admin";
        else if (r == Role.Reporter) return "Reporter";
        else return "Investigator";
    }


    function checkUser(address addr) external view returns (uint) {
        return users[addr].userAddress != address(0) ? 1 : 0;
    }
}
