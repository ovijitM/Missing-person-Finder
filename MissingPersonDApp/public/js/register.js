document.addEventListener("DOMContentLoaded", () => {
    const connectWalletBtn = document.getElementById("connectWalletBtn");
    const registerBtn = document.getElementById("registerBtn");
    const registrationForm = document.getElementById("registrationForm");
    const walletMessage = document.getElementById("walletMessage");
    const txModal = new bootstrap.Modal(document.getElementById("txModal"));
    const txModalMessage = document.getElementById("txModalMessage");

    connectWalletBtn.addEventListener("click", async () => {
        try {
            await initWeb3();
            registrationForm.removeAttribute("disabled");
            registerBtn.removeAttribute("disabled");
            walletMessage.innerText = `Wallet connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
            walletMessage.parentElement.className = "alert alert-success d-flex align-items-center";
        } catch (error) {
            walletMessage.innerText = "Failed to connect wallet: " + error.message;
            walletMessage.parentElement.className = "alert alert-danger d-flex align-items-center";
        }
    });

    registrationForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("userName").value;
        const nationalId = document.getElementById("nationalId").value;
        const role = document.getElementById("userRole").value;
        if (!account) {
            showError("Please connect wallet first");
            return;
        }
        try {
            txModal.show();
            txModalMessage.innerText = "Confirming transaction in your wallet...";
            const result = await contract.methods.registerUser(name, role, nationalId).send({ from: account });
            txModalMessage.innerText = result.events.UserRegistered.returnValues[0];
            setTimeout(() => {
                txModal.hide();
                window.location.href = "dashboard.html";
            }, 2000);
        } catch (error) {
            txModalMessage.innerText = "Error: " + error.message;
            txModalMessage.className = "text-danger";
            setTimeout(() => txModal.hide(), 3000);
        }
    });
});