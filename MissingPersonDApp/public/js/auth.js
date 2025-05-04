document.addEventListener("DOMContentLoaded", async () => {
    const connectWalletBtn = document.getElementById("connectWalletBtn");
    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const showLoginBtn = document.getElementById("showLoginBtn");
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const registerBtn = document.getElementById("registerBtn");

    // Check if already connected and registered
    if (window.ethereum && window.ethereum.selectedAddress) {
        await initWeb3();
        const role = await getUserRole();
        if (role !== null) {
            window.location.href = "dashboard.html";
        }
    }

    connectWalletBtn.addEventListener("click", async () => {
        try {
            await initWeb3();
            const role = await getUserRole();
            if (role !== null) {
                window.location.href = "dashboard.html";
            } else {
                loginSection.style.display = "none";
                registerSection.style.display = "block";
                connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i> Wallet Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
                connectWalletBtn.className = "btn btn-success btn-lg w-100 mb-3";
            }
        } catch (error) {
            showError("Failed to connect wallet: " + error.message);
        }
    });

    showRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    });

    showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    registerBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const name = document.getElementById("registerName").value;
        const nationalId = document.getElementById("registerNationalId").value;
        const role = document.getElementById("registerRole").value;
        if (!account) {
            showError("Please connect wallet first");
            return;
        }
        try {
            const result = await contract.methods.registerUser(name, role, nationalId).send({ from: account });
            showError(result.events.UserRegistered.returnValues[0]);
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
        } catch (error) {
            showError("Registration failed: " + error.message);
        }
    });
});