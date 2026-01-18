/**
 * Missing Person Finder - DApp Frontend
 * Complete Web3 integration with MetaMask
 */

let web3;
let contract;
let userAccount;
let userRole;

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  checkMetaMaskConnection();
});

function initializeEventListeners() {
  // Wallet connection
  document
    .getElementById("connectBtn")
    .addEventListener("click", connectMetaMask);
  document
    .getElementById("disconnectBtn")
    .addEventListener("click", disconnectWallet);

  // Tab navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => switchTab(e.target.dataset.tab));
  });

  // Form submissions
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  document
    .getElementById("reportForm")
    .addEventListener("submit", handleReportMissing);
  document
    .getElementById("bookForm")
    .addEventListener("submit", handleBookAppointment);
  document
    .getElementById("searchForm")
    .addEventListener("submit", handleCaseSearch);
  document
    .getElementById("divisionForm")
    .addEventListener("submit", handleDivisionSearch);
  document
    .getElementById("updateStatusForm")
    .addEventListener("submit", handleUpdateStatus);
  document
    .getElementById("assignForm")
    .addEventListener("submit", handleAssignInvestigator);
  document
    .getElementById("slotsForm")
    .addEventListener("submit", handleViewSlots);

  // Button events
  document
    .getElementById("connectBtn")
    .addEventListener("click", connectMetaMask);
  document
    .getElementById("loadAllCasesBtn")
    .addEventListener("click", loadAllCases);
  document
    .getElementById("loadScheduleBtn")
    .addEventListener("click", loadMySchedule);
  document.getElementById("loadStatsBtn").addEventListener("click", loadStats);
  document
    .getElementById("withdrawBtn")
    .addEventListener("click", handleWithdraw);
}

/* ========================================
   METAMASK CONNECTION
   ======================================== */

async function checkMetaMaskConnection() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        userAccount = accounts[0];
        initializeWeb3();
        await getUserRole();
        showAlert(
          `Connected to wallet: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`,
          "success",
        );
        updateUIAfterConnection();
        updateTabVisibility();
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  }
}

async function connectMetaMask() {
  if (!window.ethereum) {
    showAlert(
      "MetaMask not installed. Please install MetaMask extension.",
      "error",
    );
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    userAccount = accounts[0];
    initializeWeb3();
    await getUserRole();
    updateUIAfterConnection();
    showAlert(
      `✅ Connected to ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`,
      "success",
    );
    updateTabVisibility();
  } catch (error) {
    showAlert("Failed to connect MetaMask: " + error.message, "error");
  }
}

function disconnectWallet() {
  userAccount = null;
  userRole = null;
  web3 = null;
  contract = null;
  updateUIBeforeConnection();
  showAlert("Wallet disconnected", "info");
}

function initializeWeb3() {
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}

/* ========================================
   ROLE-BASED ACCESS CONTROL
   ======================================== */

async function getUserRole() {
  try {
    if (!contract || !userAccount) return;

    const users = await contract.methods.users(userAccount).call();
    if (users.isRegistered) {
      userRole = users.role;
      console.log("User role:", ROLES[userRole]);
    } else {
      userRole = null;
      console.log("User not registered");
    }
  } catch (error) {
    console.warn("Error fetching user role:", error.message);
    userRole = null;
  }
}

function updateTabVisibility() {
  const tabs = {
    register: true, // Everyone can see registration
    reporter: userRole === "1" || userRole === 1, // Only Reporters
    search: true, // Everyone can search
    investigator: userRole === "2" || userRole === 2, // Only Investigators
    admin: userRole === "0" || userRole === 0, // Only Admins
    stats: true, // Everyone can see stats
  };

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const tabId = btn.dataset.tab;
    if (tabs[tabId]) {
      btn.style.display = "inline-flex";
    } else {
      btn.style.display = "none";
    }
  });

  // If current tab is hidden, switch to first visible tab
  const activeTab = document.querySelector(".tab-content.active");
  if (activeTab && !tabs[activeTab.id]) {
    const firstVisibleTab = Object.keys(tabs).find((key) => tabs[key]);
    if (firstVisibleTab) {
      switchTab(firstVisibleTab);
    }
  }
}

function checkPermission(requiredRole) {
  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return false;
  }

  if (requiredRole && userRole !== requiredRole) {
    const roleNames = { 0: "Admin", 1: "Reporter", 2: "Investigator" };
    showAlert(
      `This action requires ${roleNames[requiredRole]} role. Your role: ${userRole !== null ? roleNames[userRole] : "Not registered"}`,
      "error",
    );
    return false;
  }

  return true;
}

function updateUIAfterConnection() {
  document.getElementById("connectBtn").style.display = "none";
  document.getElementById("walletInfo").style.display = "flex";
  const walletEl = document.getElementById("walletAddress");
  const roleEl = document.getElementById("walletRole");

  walletEl.textContent =
    userAccount.slice(0, 10) + "..." + userAccount.slice(-8);

  if (userRole !== null) {
    const roleNames = { 0: "Admin", 1: "Reporter", 2: "Investigator" };
    roleEl.textContent = roleNames[userRole] || "Unknown";
    roleEl.style.display = "inline-block";
  } else {
    roleEl.textContent = "Not Registered";
    roleEl.style.display = "inline-block";
  }
}

function updateUIBeforeConnection() {
  document.getElementById("connectBtn").style.display = "block";
  document.getElementById("walletInfo").style.display = "none";
}

/* ========================================
   TAB NAVIGATION
   ======================================== */

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active from all buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName).classList.add("active");

  // Mark button as active
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

/* ========================================
   USER REGISTRATION
   ======================================== */

async function handleRegister(e) {
  e.preventDefault();

  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  const name = document.getElementById("regName").value.trim();
  const roleIndex = document.getElementById("regRole").value;
  const nid = document.getElementById("regNID").value;

  if (!name || !roleIndex || !nid) {
    showAlert("Please fill all fields", "error");
    return;
  }

  if (nid.length !== 10 || isNaN(nid)) {
    showAlert("NID must be exactly 10 digits", "error");
    return;
  }

  try {
    showLoading("registerStatus", "Registering user...");

    const result = await contract.methods
      .registerUser(name, roleIndex, nid)
      .send({
        from: userAccount,
        gas: 300000,
      });

    userRole = roleIndex;
    document.getElementById("registerForm").reset();
    updateTabVisibility();
    updateUIAfterConnection();
    showAlert(`✅ Successfully registered as ${ROLES[roleIndex]}!`, "success");
    showSuccess(
      "registerStatus",
      `User registered successfully! Role: ${ROLES[roleIndex]}`,
    );
  } catch (error) {
    showAlert("Registration failed: " + error.message, "error");
    showError("registerStatus", "Registration failed. See alert.");
  }
}

/* ========================================
   REPORT MISSING PERSON
   ======================================== */

async function handleReportMissing(e) {
  e.preventDefault();

  if (!checkPermission(1)) return; // 1 = Reporter

  const name = document.getElementById("rpName").value.trim();
  const age = document.getElementById("rpAge").value;
  const height = document.getElementById("rpHeight").value;
  const description = document.getElementById("rpDescription").value.trim();
  const location = document.getElementById("rpLocation").value;
  const contact = document.getElementById("rpContact").value;

  if (!name || !age || !height || !description || !location || !contact) {
    showAlert("Please fill all fields", "error");
    return;
  }

  try {
    showLoading("reportStatus", "Submitting report...");

    const result = await contract.methods
      .reportMissingPerson(
        name,
        age,
        height,
        description,
        location,
        parseInt(contact),
      )
      .send({
        from: userAccount,
        gas: 500000,
      });

    const caseId =
      result.events?.MissingPersonReported?.returnValues?.caseId || "N/A";
    document.getElementById("reportForm").reset();
    showAlert(`✅ Case reported successfully! Case ID: ${caseId}`, "success");
    showSuccess("reportStatus", `Missing person reported! Case ID: ${caseId}`);
  } catch (error) {
    showAlert("Report failed: " + error.message, "error");
    showError("reportStatus", "Failed to report. See alert.");
  }
}

/* ========================================
   BOOK APPOINTMENT
   ======================================== */

async function handleBookAppointment(e) {
  e.preventDefault();

  if (!checkPermission(1)) return; // 1 = Reporter

  const caseId = document.getElementById("bookCaseId").value;
  const investigator = document.getElementById("bookInvestigator").value.trim();
  const slotIndex = document.getElementById("bookSlot").value;
  const amount = document.getElementById("bookAmount").value;

  if (!caseId || !investigator || !slotIndex || !amount) {
    showAlert("Please fill all fields", "error");
    return;
  }

  if (!web3.utils.isAddress(investigator)) {
    showAlert("Invalid Ethereum address", "error");
    return;
  }

  try {
    showLoading("bookStatus", "Processing payment...");

    const weiAmount = web3.utils.toWei(amount.toString(), "ether");

    const result = await contract.methods
      .bookAppointment(caseId, investigator, slotIndex)
      .send({
        from: userAccount,
        value: weiAmount,
        gas: 500000,
      });

    document.getElementById("bookForm").reset();
    showAlert(
      `✅ Appointment booked successfully! Slot: ${slotIndex}`,
      "success",
    );
    showSuccess("bookStatus", `Appointment booked! Paid: ${amount} ETH`);
  } catch (error) {
    showAlert("Booking failed: " + error.message, "error");
    showError("bookStatus", "Failed to book appointment. See alert.");
  }
}

/* ========================================
   SEARCH & VIEW CASES
   ======================================== */

async function handleCaseSearch(e) {
  e.preventDefault();

  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  const caseId = document.getElementById("searchCaseId").value;

  if (!caseId) {
    showAlert("Please enter a case ID", "error");
    return;
  }

  try {
    showLoading("caseDetails", "Fetching case details...");

    const caseData = await contract.methods.getCaseDetails(caseId).call();
    displayCaseDetails(caseData);
  } catch (error) {
    showAlert("Case not found: " + error.message, "error");
    document.getElementById("caseDetails").innerHTML = "";
  }
}

function displayCaseDetails(caseData) {
  const container = document.getElementById("caseDetails");

  const statusClass = caseData.status == 0 ? "status-missing" : "status-found";
  const statusText = STATUS[caseData.status];
  const urgencyText = URGENCY[caseData.urgency];

  const html = `
        <div class="case-card">
            <div class="case-card-header">
                <div>
                    <div class="case-id">Case #${caseData.caseId}</div>
                    <small class="text-muted">Reported: ${new Date(caseData.reportTime * 1000).toLocaleString()}</small>
                </div>
                <span class="case-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="case-grid">
                <div class="case-field">
                    <label>Name</label>
                    <value>${caseData.name}</value>
                </div>
                <div class="case-field">
                    <label>Age</label>
                    <value>${caseData.age} years</value>
                </div>
                <div class="case-field">
                    <label>Height</label>
                    <value>${caseData.height} cm</value>
                </div>
                <div class="case-field">
                    <label>Urgency</label>
                    <value>${urgencyText}</value>
                </div>
                <div class="case-field">
                    <label>Last Seen Location</label>
                    <value>${caseData.lastSeenLocation}</value>
                </div>
                <div class="case-field">
                    <label>Contact Number</label>
                    <value>${caseData.relativeContactNumber}</value>
                </div>
            </div>
            
            <div class="case-field" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                <label>Description</label>
                <value>${caseData.description}</value>
            </div>
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary);">
                Reporter: ${caseData.reporter.slice(0, 10)}...${caseData.reporter.slice(-8)}
            </div>
        </div>
    `;

  container.innerHTML = html;
}

async function handleDivisionSearch(e) {
  e.preventDefault();

  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  const divisionId = document.getElementById("divisionSelect").value;

  if (divisionId === "") {
    showAlert("Please select a division", "error");
    return;
  }

  try {
    showLoading("divisionResults", "Fetching cases...");

    const caseIds = await contract.methods
      .getMissingPersonsByDivision(divisionId)
      .call();
    displayCaseIds(caseIds, "divisionResults", DIVISIONS[divisionId]);
  } catch (error) {
    showAlert("Failed to fetch cases: " + error.message, "error");
    document.getElementById("divisionResults").innerHTML = "";
  }
}

async function loadAllCases() {
  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  try {
    showLoading("allCasesList", "Loading all cases...");

    const caseIds = await contract.methods.getAllCaseIds().call();
    displayCaseIds(caseIds, "allCasesList", "All Cases");
  } catch (error) {
    showAlert("Failed to load cases: " + error.message, "error");
    document.getElementById("allCasesList").innerHTML = "";
  }
}

function displayCaseIds(caseIds, containerId, title) {
  const container = document.getElementById(containerId);

  if (caseIds.length === 0) {
    container.innerHTML = '<div class="result-item">No cases found.</div>';
    return;
  }

  let html = "";
  caseIds.forEach((id, index) => {
    html += `<div class="result-item">
            <strong>Case #${id}</strong>
            <small class="text-muted">Click the case ID to view details</small>
        </div>`;
  });

  container.innerHTML = html;
}

/* ========================================
   INVESTIGATOR FUNCTIONS
   ======================================== */

async function loadMySchedule() {
  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  try {
    showLoading("mySchedule", "Loading your schedule...");

    const schedule = await contract.methods.myFormattedSchedule().call({
      from: userAccount,
    });

    displaySchedule(schedule);
  } catch (error) {
    showAlert("Error loading schedule: " + error.message, "error");
    document.getElementById("mySchedule").innerHTML = "";
  }
}

function displaySchedule(schedule) {
  const container = document.getElementById("mySchedule");

  if (!schedule || schedule.length === 0) {
    container.innerHTML =
      '<div class="schedule-item">No appointments scheduled yet.</div>';
    return;
  }

  let html = "";
  schedule.forEach((appointment, index) => {
    html += `<div class="schedule-item">
            <strong>Appointment ${index + 1}</strong>
            <div style="font-size: 14px; margin-top: 8px;">${appointment}</div>
        </div>`;
  });

  container.innerHTML = html;
}

async function handleViewSlots(e) {
  e.preventDefault();

  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  const investigator = document
    .getElementById("slotsInvestigator")
    .value.trim();

  if (!investigator) {
    showAlert("Please enter investigator address", "error");
    return;
  }

  if (!web3.utils.isAddress(investigator)) {
    showAlert("Invalid Ethereum address", "error");
    return;
  }

  try {
    showLoading("availableSlots", "Loading available slots...");

    const slots = await contract.methods.getAvailableSlots(investigator).call({
      from: userAccount,
    });

    displaySlots(slots);
  } catch (error) {
    showAlert("Error loading slots: " + error.message, "error");
    document.getElementById("availableSlots").innerHTML = "";
  }
}

function displaySlots(slots) {
  const container = document.getElementById("availableSlots");

  let html = "";
  let availableCount = 0;

  slots.forEach((isAvailable, index) => {
    if (isAvailable) availableCount++;
    const status = isAvailable ? "slot-available" : "slot-booked";
    const text = isAvailable ? `Slot ${index}` : `Booked`;
    html += `<div class="slot-item ${status}">${text}</div>`;
  });

  if (availableCount === 0) {
    container.innerHTML = '<div class="result-item">No available slots.</div>';
  } else {
    container.innerHTML = html;
  }
}

/* ========================================
   ADMIN FUNCTIONS
   ======================================== */

async function handleUpdateStatus(e) {
  e.preventDefault();

  if (!checkPermission(0)) return; // 0 = Admin

  const caseId = document.getElementById("updateCaseId").value;

  if (!caseId) {
    showAlert("Please enter case ID", "error");
    return;
  }

  try {
    showLoading("updateStatus", "Updating status...");

    const result = await contract.methods.updatePersonStatus(caseId).send({
      from: userAccount,
      gas: 300000,
    });

    document.getElementById("updateCaseId").value = "";
    showAlert("✅ Status updated to 'Found'", "success");
    showSuccess("updateStatus", "Case marked as Found");
  } catch (error) {
    showAlert("Failed to update: " + error.message, "error");
    showError("updateStatus", "Failed to update status");
  }
}

async function handleAssignInvestigator(e) {
  e.preventDefault();

  if (!checkPermission(0)) return; // 0 = Admin

  const caseId = document.getElementById("assignCaseId").value;
  const investigator = document
    .getElementById("assignInvestigator")
    .value.trim();

  if (!caseId || !investigator) {
    showAlert("Please fill all fields", "error");
    return;
  }

  if (!web3.utils.isAddress(investigator)) {
    showAlert("Invalid Ethereum address", "error");
    return;
  }

  try {
    showLoading("assignStatus", "Assigning investigator...");

    const result = await contract.methods
      .assignInvestigator(caseId, investigator)
      .send({
        from: userAccount,
        gas: 300000,
      });

    document.getElementById("assignForm").reset();
    showAlert("✅ Investigator assigned successfully", "success");
    showSuccess("assignStatus", "Investigator assigned to case");
  } catch (error) {
    showAlert("Failed to assign: " + error.message, "error");
    showError("assignStatus", "Failed to assign investigator");
  }
}

async function handleWithdraw() {
  if (!checkPermission(0)) return; // 0 = Admin

  if (!confirm("Are you sure you want to withdraw all funds?")) {
    return;
  }

  try {
    showLoading("withdrawStatus", "Processing withdrawal...");

    const result = await contract.methods.withdrawFunds().send({
      from: userAccount,
      gas: 300000,
    });

    showAlert("✅ Funds withdrawn successfully", "success");
    showSuccess("withdrawStatus", "Funds withdrawn to wallet");
  } catch (error) {
    showAlert("Withdrawal failed: " + error.message, "error");
    showError("withdrawStatus", "Failed to withdraw funds");
  }
}

/* ========================================
   STATISTICS
   ======================================== */

async function loadStats() {
  if (!userAccount) {
    showAlert("Please connect MetaMask first", "error");
    return;
  }

  try {
    showLoading("statsResults", "Loading statistics...");

    const stats = await contract.methods
      .getAllDivisionWiseMissingCounts()
      .call();
    displayStats(stats);
  } catch (error) {
    showAlert("Failed to load stats: " + error.message, "error");
    document.getElementById("statsResults").innerHTML = "";
  }
}

function displayStats(stats) {
  const container = document.getElementById("statsResults");

  if (!stats || stats.length === 0) {
    container.innerHTML =
      '<div class="stat-item">No statistics available.</div>';
    return;
  }

  let html = "";
  stats.forEach((stat) => {
    html += `<div class="stat-item">${stat}</div>`;
  });

  container.innerHTML = html;
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

function showAlert(message, type = "info") {
  const container = document.getElementById("alertContainer");
  const alertId = "alert-" + Date.now();

  const alertHTML = `
        <div id="${alertId}" class="alert alert-${type}">
            <span>${message}</span>
            <button class="alert-close" onclick="document.getElementById('${alertId}').remove()">×</button>
        </div>
    `;

  container.insertAdjacentHTML("beforeend", alertHTML);

  // Auto remove after 5 seconds
  setTimeout(() => {
    const alert = document.getElementById(alertId);
    if (alert) alert.remove();
  }, 5000);
}

function showLoading(elementId, message = "Loading...") {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="result-item"><span class="loading"></span> ${message}</div>`;
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert alert-success" style="margin: 0;"><span>${message}</span></div>`;
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert alert-error" style="margin: 0;"><span>${message}</span></div>`;
}

// Handle network changes
if (window.ethereum) {
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });

  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      userAccount = accounts[0];
      initializeWeb3();
      showAlert(
        "Account changed: " +
          userAccount.slice(0, 6) +
          "..." +
          userAccount.slice(-4),
        "info",
      );
    }
  });
}
