document.addEventListener("DOMContentLoaded", async () => {
    if (!(await restrictAccess(1))) return; // Restrict to Reporters
    const reportCard = document.querySelector(".card-body");
    reportCard.innerHTML = `
        <form id="reportForm">
            <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" id="name" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Age</label>
                <input type="number" class="form-control" id="age" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Height (cm)</label>
                <input type="number" class="form-control" id="height" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <input type="text" class="form-control" id="description" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Last Seen Location</label>
                <select class="form-select" id="lastSeenLocation" required>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Relative Contact Number</label>
                <input type="number" class="form-control" id="relativeContact" required>
            </div>
            <button type="submit" class="btn btn-primary">Report</button>
        </form>
        <div id="reportResult" class="mt-3"></div>
        <h5 class="mt-4">Book Investigation Slot</h5>
        <form id="bookForm">
            <div class="mb-3">
                <label class="form-label">Case ID</label>
                <input type="number" class="form-control" id="caseId" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Investigator Address</label>
                <input type="text" class="form-control" id="investigator" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Slot Index (0-59)</label>
                <input type="number" class="form-control" id="slotIndex" required>
            </div>
            <button type="submit" class="btn btn-primary">Book Slot</button>
        </form>
        <div id="bookResult" class="mt-3"></div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", logout);

    document.getElementById("reportForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const height = document.getElementById("height").value;
        const description = document.getElementById("description").value;
        const lastSeenLocation = document.getElementById("lastSeenLocation").value;
        const relativeContact = document.getElementById("relativeContact").value;
        const resultDiv = document.getElementById("reportResult");
        try {
            const result = await contract.methods.reportMissingPerson(name, age, height, description, lastSeenLocation, relativeContact).send({ from: account });
            resultDiv.innerText = `Reported successfully, Case ID: ${result.events.MissingPersonReported.returnValues.caseId}`;
            resultDiv.className = "alert alert-success";
            loadCases();
        } catch (error) {
            resultDiv.innerText = "Error: " + error.message;
            resultDiv.className = "alert alert-danger";
        }
    });

    document.getElementById("bookForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const caseId = document.getElementById("caseId").value;
        const investigator = document.getElementById("investigator").value;
        const slotIndex = document.getElementById("slotIndex").value;
        const resultDiv = document.getElementById("bookResult");
        try {
            const result = await contract.methods.bookAppointment(caseId, investigator, slotIndex).send({
                from: account,
                value: web3.utils.toWei("0.01", "ether")
            });
            contract.events.AppointmentBooked()
                .on("data", (event) => {
                    resultDiv.innerText = `Success: Appointment booked for Case #${event.returnValues.caseId}`;
                    resultDiv.className = "alert alert-success";
                });
        } catch (error) {
            resultDiv.innerText = "Error: " + error.message;
            resultDiv.className = "alert alert-danger";
        }
    });

    async function loadCases() {
        const casesContainer = document.getElementById("casesContainer");
        try {
            const caseIds = await contract.methods.getAllCaseIds().call({ from: account });
            casesContainer.innerHTML = "";
            for (let caseId of caseIds) {
                const details = await contract.methods.getCaseDetails(caseId).call({ from: account });
                if (details.reporter.toLowerCase() === account.toLowerCase() && details.isActive) {
                    const card = document.createElement("div");
                    card.className = "col-md-6 mb-3";
                    card.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Case #${details.caseId}</h5>
                                <p class="card-text">Name: ${details.name}</p>
                                <p class="card-text">Age: ${details.age}</p>
                                <p class="card-text">Status: ${details.status == 0 ? "Missing" : "Found"}</p>
                            </div>
                        </div>
                    `;
                    casesContainer.appendChild(card);
                }
            }
        } catch (error) {
            showError("Error loading cases: " + error.message);
        }
    }

    loadCases();
});