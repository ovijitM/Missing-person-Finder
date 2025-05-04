document.addEventListener("DOMContentLoaded", async () => {
    if (!(await restrictAccess(0))) return; // Restrict to Admins
    const content = document.querySelector(".admin-content");
    content.innerHTML = `
        <div class="card mb-4">
            <div class="card-header bg-dark text-white"><i class="fas fa-user-check me-2"></i>Update Missing Person Status</div>
            <div class="card-body">
                <form id="updateStatusForm">
                    <div class="mb-3">
                        <label class="form-label">Case ID</label>
                        <input type="number" class="form-control" id="updateCaseId" required>
                    </div>
                    <button type="submit" class="btn btn-dark">Update to Found</button>
                </form>
                <div id="updateResult" class="mt-3"></div>
            </div>
        </div>
        <div class="card">
            <div class="card-header bg-dark text-white"><i class="fas fa-user-tie me-2"></i>Assign Investigator</div>
            <div class="card-body">
                <form id="assignInvestigatorForm">
                    <div class="mb-3">
                        <label class="form-label">Case ID</label>
                        <input type="number" class="form-control" id="assignCaseId" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Investigator Address</label>
                        <input type="text" class="form-control" id="investigatorAddress" required>
                    </div>
                    <button type="submit" class="btn btn-dark">Assign</button>
                </form>
                <div id="assignResult" class="mt-3"></div>
            </div>
        </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", logout);

    document.getElementById("updateStatusForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const caseId = document.getElementById("updateCaseId").value;
        const resultDiv = document.getElementById("updateResult");
        try {
            const result = await contract.methods.updatePersonStatus(caseId).send({ from: account });
            resultDiv.innerText = result.events.StatusUpdated.returnValues[0];
            resultDiv.className = "alert alert-success";
        } catch (error) {
            resultDiv.innerText = "Error: " + error.message;
            resultDiv.className = "alert alert-danger";
        }
    });

    document.getElementById("assignInvestigatorForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const caseId = document.getElementById("assignCaseId").value;
        const investigator = document.getElementById("investigatorAddress").value;
        const resultDiv = document.getElementById("assignResult");
        try {
            const result = await contract.methods.assignInvestigator(caseId, investigator).send({ from: account });
            resultDiv.innerText = result.events.InvestigatorAssigned.returnValues[0];
            resultDiv.className = "alert alert-success";
        } catch (error) {
            resultDiv.innerText = "Error: " + error.message;
            resultDiv.className = "alert alert-danger";
        }
    });
});