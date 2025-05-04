let web3, contract, account;

async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            account = (await web3.eth.getAccounts())[0];
            const contractAddress = ""; // Replace with your deployed contract address
            const contractABI = YOUR_CONTRACT_ABI; // Replace with ABI from build/contracts/MissingPersonsSystem.json
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Web3 initialized, account:", account);
            updateAccountDisplay();
        } catch (error) {
            console.error("MetaMask connection failed:", error);
            showError("Please connect MetaMask");
        }
    } else {
        showError("Please install MetaMask");
    }
}

async function updateAccountDisplay() {
    const accountDisplay = document.getElementById("account");
    if (accountDisplay && account) {
        accountDisplay.innerText = `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    }
    const userNameSpan = document.getElementById("userName");
    if (userNameSpan && account) {
        try {
            const user = await contract.methods.users(account).call();
            if (user.isRegistered) {
                userNameSpan.innerText = user.name;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }
}

async function getUserRole() {
    if (!contract || !account) return null;
    const user = await contract.methods.users(account).call();
    if (!user.isRegistered) return null;
    return user.role; // 0: Admin, 1: Reporter, 2: Investigator
}

async function restrictAccess(allowedRole) {
    const role = await getUserRole();
    if (role === null) {
        showError("Please register first");
        window.location.href = "register.html";
        return false;
    }
    if (role != allowedRole) {
        showError(`Access restricted to ${allowedRole == 0 ? "Admins" : allowedRole == 1 ? "Reporters" : "Investigators"}`);
        window.location.href = "index.html";
        return false;
    }
    return true;
}

function showError(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger mt-3";
    alert.innerText = message;
    const container = document.querySelector(".container, .auth-container, .dashboard-container") || document.body;
    container.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

function logout() {
    account = null;
    window.location.href = "index.html";
}

window.addEventListener("load", initWeb3);