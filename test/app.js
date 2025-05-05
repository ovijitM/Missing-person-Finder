let web3;
let accounts = [];

async function loadContract() {
    const response = await fetch('../build/contracts/MissingPersonsSystem.json');
    const data = await response.json();

    const abi = data.abi;

    const address= await fetch('../src/contracts/contract-address.json');
    const addressData = await address.json();
    const contractAddress = addressData.MissingPersonsSystem.address;
    // console.log("Contract Address:", contractAddress);

    return new web3.eth.Contract(abi, contractAddress);
}


async function registerUser() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed!");
            return;
        }

        web3 = new Web3(window.ethereum);
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
            alert("Wallet not connected.");
            return;
        }

        document.getElementById('walletAddress').innerText = "Connected Wallet: " + accounts[0];

        const name = document.getElementById("name").value;
        const role = parseInt(document.getElementById("role").value);
        const nid = parseInt(document.getElementById("nid").value);

        if (!name || isNaN(role) || isNaN(nid)) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const contract = await loadContract();
        const result = await contract.methods.registerUser(name, role, nid).send({
            from: accounts[0]
        });

        alert("User registered successfully!");
    } catch (error) {
        alert("Registration failed. Check the console.");
    }
}


async function reportMissingPerson() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed!");
            return;
        }

        web3 = new Web3(window.ethereum);
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        const contract = await loadContract();

        const name = document.getElementById("rp_name").value;
        const age = parseInt(document.getElementById("rp_age").value);
        const height = parseInt(document.getElementById("rp_height").value);
        const description = document.getElementById("rp_description").value;
        const location = document.getElementById("rp_location").value;
        const contact = parseInt(document.getElementById("rp_contact").value);

        const result = await contract.methods
            .reportMissingPerson(name, age, height, description, location, contact)
            .send({ from: accounts[0] });

        console.log("Missing person reported:", result);
        document.getElementById("rp_status").innerText = "Missing person reported successfully!";
    } catch (error) {
        console.error("Error reporting missing person:", error);
        document.getElementById("rp_status").innerText = "Error reporting missing person. See console.";
    }
}


async function updatePersonStatus() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed!");
            return;
        }

        web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        const contract = await loadContract();

        const caseId = parseInt(document.getElementById("status_case_id").value);

        const result = await contract.methods
            .updatePersonStatus(caseId)
            .send({ from: accounts[0] });

        console.log("Status updated:", result);
        document.getElementById("update_status_result").innerText = "Status updated to 'Found' successfully!";
    } catch (error) {
        console.error("Error updating status:", error);
        document.getElementById("update_status_result").innerText = "Error: Check console/log.";
    }
}


async function assignInvestigator() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed!");
            return;
        }

        web3 = new Web3(window.ethereum);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        const contract = await loadContract();

        const caseId = parseInt(document.getElementById("assign_case_id").value);
        const investigatorAddress = document.getElementById("investigator_address").value;

        const result = await contract.methods
            .assignInvestigator(caseId, investigatorAddress)
            .send({ from: accounts[0] });

        console.log("Investigator assigned:", result);
        document.getElementById("assign_status_result").innerText = "Investigator assigned successfully!";
    } catch (error) {
        console.error("Error assigning investigator:", error);
        document.getElementById("assign_status_result").innerText = "Error: Check console/log.";
    }
}

async function bookAppointment() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed.");
            return;
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        web3 = new Web3(window.ethereum);
        const contract = await loadContract();

        const caseId = parseInt(document.getElementById("book_case_id").value);
        const investigatorAddress = document.getElementById("book_investigator_address").value;
        const slotIndex = parseInt(document.getElementById("slot_index").value);

        const bookingFee = web3.utils.toWei("0.01", "ether");

        const result = await contract.methods
            .bookAppointment(caseId, investigatorAddress, slotIndex)
            .send({
                from: accounts[0],
                value: bookingFee
            });

        console.log("Appointment booked:", result);
        document.getElementById("appointment_status").innerText = "Appointment booked successfully!";
    } catch (error) {
        console.error("Booking error:", error);
        document.getElementById("appointment_status").innerText = "Error booking appointment. See console.";
    }
}

async function getCaseDetails() {
    try {
        const caseId = parseInt(document.getElementById("view_case_id").value);

        web3 = new Web3(window.ethereum);
        const contract = await loadContract();

        const person = await contract.methods.getCaseDetails(caseId).call();

        const urgencyLevels = ["Low", "Medium", "High"];
        const statuses = ["Missing", "Found"];

        const display = `
            Case ID: ${person.caseId}
            Name: ${person.name}
            Age: ${person.age}
            Height: ${person.height} cm
            Status: ${statuses[person.status]}
            Urgency: ${urgencyLevels[person.urgency]}
            Description: ${person.description}
            Last Seen Location: ${person.lastSeenLocation}
            Relative Contact: ${person.relativeContactNumber}
            Reporter: ${person.reporter}
            Report Time (UNIX): ${person.reportTime}
            Active: ${person.isActive}
        `;

        document.getElementById("case_details").innerText = display;
    } catch (error) {
        console.error("Error getting case details:", error);
        document.getElementById("case_details").innerText = "Error fetching case details. See console.";
    }
}


async function fetchAllCaseIds() {
    try {
        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const caseIds = await contract.methods.getAllCaseIds().call();

        const list = document.getElementById("caseIdList");
        if (!list) {
            console.error("Element with ID 'caseIdList' not found in the DOM.");
            return;
        }

        list.innerHTML = ""; 

        caseIds.forEach((id) => {
            const li = document.createElement("li");
            li.innerText = `Case ID: ${id}`;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching case IDs:", error);
        alert("Could not load case IDs. Check the console for details.");
    }
}


async function fetchMissingPersonsByDivision() {
    try {
        const divisionId = document.getElementById("divisionId").value;

        // Check if divisionId is valid
        if (!divisionId) {
            alert("Please select a valid Division.");
            return;
        }

        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const missingPersons = await contract.methods.getMissingPersonsByDivision(divisionId).call();

        const list = document.getElementById("missingPersonsList");
        if (!list) {
            console.error("Element with ID 'missingPersonsList' not found in the DOM.");
            return;
        }

        list.innerHTML = ""; // Clear existing items

        if (missingPersons.length === 0) {
            const li = document.createElement("li");
            li.innerText = "No missing persons found for this division.";
            list.appendChild(li);
            return;
        }

        missingPersons.forEach((id) => {
            const li = document.createElement("li");
            li.innerText = `Case ID: ${id}`;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching missing persons:", error);
        alert("Could not load missing persons. Check the console for details.");
    }
}


async function fetchAllDivisionWiseMissingCounts() {
    try {
        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const divisionStats = await contract.methods.getAllDivisionWiseMissingCounts().call();

        const list = document.getElementById("divisionStatsList");
        if (!list) {
            console.error("Element with ID 'divisionStatsList' not found in the DOM.");
            return;
        }

        list.innerHTML = ""; // Clear existing items

        if (divisionStats.length === 0) {
            const li = document.createElement("li");
            li.innerText = "No division stats available.";
            list.appendChild(li);
            return;
        }

        divisionStats.forEach((stat) => {
            const li = document.createElement("li");
            li.innerText = stat;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching division-wise missing counts:", error);
        alert("Could not load division stats. Check the console for details.");
    }
}

async function fetchInvestigatorSchedule() {
    const address = document.getElementById("investigatorAddress").value.trim();
    if (!address) {
        alert("Please enter a valid investigator address.");
        return;
    }

    try {
        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const schedule = await contract.methods.getInvestigatorSchedule(address).call({ from: ethereum.selectedAddress });

        const list = document.getElementById("scheduleList");
        list.innerHTML = ""; // Clear existing items

        if (schedule.length === 0) {
            const li = document.createElement("li");
            li.innerText = "No appointments found.";
            list.appendChild(li);
            return;
        }

        schedule.forEach((appt, index) => {
            const li = document.createElement("li");
            li.innerText = `#${index + 1}: CaseID: ${appt.caseId}, Slot: ${appt.slotIndex}, Reporter: ${appt.reporter}, Paid: ${appt.paid ? "Yes" : "No"}, Amount: ${window.web3.utils.fromWei(appt.amount, "ether")} ETH`;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching schedule:", error);
        alert("Failed to fetch schedule. See console for details.");
    }
}



async function fetchMyFormattedSchedule() {
    try {
        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0];

        const formattedSchedule = await contract.methods.myFormattedSchedule().call({ from: currentAccount });

        const list = document.getElementById("formattedScheduleList");
        list.innerHTML = ""; 

        if (formattedSchedule.length === 0) {
            const li = document.createElement("li");
            li.innerText = "No scheduled appointments found.";
            list.appendChild(li);
            return;
        }

        formattedSchedule.forEach(item => {
            const li = document.createElement("li");
            li.innerText = item;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading formatted schedule:", error);
        alert("Failed to load formatted schedule. Check console for details.");
    }
}

async function fetchAvailableSlots() {
    try {
        web3 = new Web3(window.ethereum);
        const contract = await loadContract();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0];
        const investigatorAddress = document.getElementById("investigatorAddress").value;

        if (!investigatorAddress) {
            alert("Please enter an investigator address.");
            return;
        }

        const available = await contract.methods.getAvailableSlots(investigatorAddress).call({ from: currentAccount });

        const list = document.getElementById("availableSlotsList");
        list.innerHTML = "";

        available.forEach((slot, index) => {
            if (slot) {
                const li = document.createElement("li");
                li.innerText = `Slot #${index} - Available`;
                list.appendChild(li);
            }
        });

        if (list.children.length === 0) {
            const li = document.createElement("li");
            li.innerText = "No available slots found.";
            list.appendChild(li);
        }

    } catch (error) {
        console.error("Error fetching available slots:", error);
        alert("Failed to load available slots. Check the console for details.");
    }
}