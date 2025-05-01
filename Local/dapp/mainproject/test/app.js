// Ensure MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
} else {
    alert('Please install MetaMask to use this app.');
}

let web3 = new Web3(window.ethereum);
let accounts = [];

// Request account access on load
window.onload = async () => {
    if (window.ethereum.selectedAddress) {
        accounts = [window.ethereum.selectedAddress];
        console.log("Connected:", accounts[0]);
    } else {
        await connectMetaMask();
    }
};

// Connect MetaMask function
async function connectMetaMask() {
    try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log("MetaMask connected:", accounts[0]);
    } catch (error) {
        console.error("MetaMask connection error:", error);
        alert("MetaMask connection failed.");
    }
}

// // Manually load contract
// async function loadContract() {
//     const response = await fetch('../build/contracts/UserRegistration.json');
//     const data = await response.json();

//     const abi = data.abi;
    
//     // ✅ Replace this with your real deployed contract address
//     const contractAddress = '0x54E6331900926e318FF033488F5d6FdbD48053dE';

//     const contract = new web3.eth.Contract(abi, contractAddress);
//     return contract;
// }

// // Register user
// async function registerUser() {
//     try {
//         if (!accounts || accounts.length === 0) {
//             alert("Please connect MetaMask first.");
//             return;
//         }

//         const contract = await loadContract();

//         // Replace these inputs with actual form values
//         const name = document.getElementById("name").value;
//         const role = parseInt(document.getElementById("role").value);
//         const nid = parseInt(document.getElementById("nid").value);

//         const result = await contract.methods.createuser(name, role, nid).send({
//             from: accounts[0]
//         });

//         console.log("User created:", result);
//         alert("User registered successfully!");

//     } catch (error) {
//         console.error("Error registering user:", error);
//         alert("Registration failed. Check the console for details.");
//     }
// }

// // Connect button event
// document.getElementById("connectBtn").addEventListener("click", connectMetaMask);

// // Register button event
// document.getElementById("registerBtn").addEventListener("click", registerUser);
