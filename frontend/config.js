/**
 * Configuration for Web3 connection and contract ABI
 */

// Replace these with your actual contract details
const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // Update with your contract address
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_roleIndex", type: "uint256" },
      { internalType: "uint256", name: "_nationalId", type: "uint256" },
    ],
    name: "registerUser",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_age", type: "uint256" },
      { internalType: "uint256", name: "_height", type: "uint256" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_lastSeenLocation", type: "string" },
      { internalType: "uint256", name: "_relativeContact", type: "uint256" },
    ],
    name: "reportMissingPerson",
    outputs: [
      { internalType: "string", name: "", type: "string" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "caseId", type: "uint256" }],
    name: "updatePersonStatus",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "caseId", type: "uint256" },
      { internalType: "address", name: "investigator", type: "address" },
    ],
    name: "assignInvestigator",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "caseId", type: "uint256" },
      { internalType: "address", name: "investigator", type: "address" },
      { internalType: "uint256", name: "slotIndex", type: "uint256" },
    ],
    name: "bookAppointment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "caseId", type: "uint256" }],
    name: "getCaseDetails",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "caseId", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "age", type: "uint256" },
          { internalType: "uint256", name: "height", type: "uint256" },
          {
            internalType: "enum MissingPersonsSystem.Status",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum MissingPersonsSystem.UrgencyLevel",
            name: "urgency",
            type: "uint8",
          },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "lastSeenLocation", type: "string" },
          {
            internalType: "uint256",
            name: "relativeContactNumber",
            type: "uint256",
          },
          { internalType: "address", name: "reporter", type: "address" },
          { internalType: "uint256", name: "reportTime", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct MissingPersonsSystem.MissingPerson",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCaseIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "divisionId", type: "uint256" }],
    name: "getMissingPersonsByDivision",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllDivisionWiseMissingCounts",
    outputs: [
      { internalType: "string[]", name: "divisionStats", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "investigator", type: "address" },
    ],
    name: "getInvestigatorSchedule",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "caseId", type: "uint256" },
          { internalType: "address", name: "investigator", type: "address" },
          { internalType: "uint256", name: "timeSlot", type: "uint256" },
          { internalType: "address", name: "reporter", type: "address" },
          { internalType: "bool", name: "completed", type: "bool" },
          { internalType: "uint256", name: "paymentAmount", type: "uint256" },
        ],
        internalType: "struct MissingPersonsSystem.Appointment[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mySchedule",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "caseId", type: "uint256" },
          { internalType: "address", name: "investigator", type: "address" },
          { internalType: "uint256", name: "timeSlot", type: "uint256" },
          { internalType: "address", name: "reporter", type: "address" },
          { internalType: "bool", name: "completed", type: "bool" },
          { internalType: "uint256", name: "paymentAmount", type: "uint256" },
        ],
        internalType: "struct MissingPersonsSystem.Appointment[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "myFormattedSchedule",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "investigator", type: "address" },
    ],
    name: "getAvailableSlots",
    outputs: [
      { internalType: "bool[60]", name: "available", type: "bool[60]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Network configuration
const NETWORKS = {
  1: { name: "Ethereum Mainnet", rpc: "https://eth-mainnet.g.alchemy.com/v2/" },
  5: { name: "Goerli", rpc: "https://goerli.infura.io/v3/" },
  11155111: { name: "Sepolia", rpc: "https://sepolia.infura.io/v3/" },
  31337: { name: "Localhost/Ganache", rpc: "http://127.0.0.1:8585" },
};

// Division mapping
const DIVISIONS = {
  0: "Dhaka",
  1: "Chittagong",
  2: "Khulna",
  3: "Barisal",
  4: "Sylhet",
  5: "Rajshahi",
  6: "Rangpur",
  7: "Mymensingh",
};

// Role mapping
const ROLES = {
  0: "Admin",
  1: "Reporter",
  2: "Investigator",
};

// Status mapping
const STATUS = {
  0: "Missing",
  1: "Found",
};

// Urgency mapping
const URGENCY = {
  0: "Low",
  1: "Medium",
  2: "High",
};
