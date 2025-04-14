// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MissingPersonsRegistry {

    enum Role { None, Admin, Reporter, Investigator }

    struct User {
        string nid;
        string name;
        Role role;
        address userAddress;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed user, string name, Role role);

    modifier onlyRegistered() {
        require(users[msg.sender].role != Role.None, "You must be a registered user.");
        _;
    }

    function registerUser(string memory _nid, string memory _name, uint _role) public {
        require(users[msg.sender].role == Role.None, "User already registered.");
        require(_role > 0 && _role <= 3, "Invalid role.");

        users[msg.sender] = User({
            nid: _nid,
            name: _name,
            role: Role(_role),
            userAddress: msg.sender
        });

        emit UserRegistered(msg.sender, _name, Role(_role));
    }

    function getUser(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }

    function exampleRestrictedAction() public onlyRegistered view returns (string memory) {
        return "You are a registered user.";
    }
}