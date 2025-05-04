document.addEventListener("DOMContentLoaded", async () => {
    const adminCard = document.getElementById("adminCard");
    const reporterCard = document.getElementById("reporterCard");
    const investigatorCard = document.getElementById("investigatorCard");
    const role = await getUserRole();

    // Show/hide role cards based on user role
    adminCard.style.display = role == 0 ? "block" : "none";
    reporterCard.style.display = role == 1 ? "block" : "none";
    investigatorCard.style.display = role == 2 ? "block" : "none";

    adminCard.querySelector("button").addEventListener("click", () => window.location.href = "admin.html");
    reporterCard.querySelector("button").addEventListener("click", () => window.location.href = "reporter.html");
    investigatorCard.querySelector("button").addEventListener("click", () => window.location.href = "investigator.html");
    document.getElementById("logoutBtn").addEventListener("click", logout);

    // Add division-wise counts
    const container = document.querySelector(".dashboard-container");
    const table = document.createElement("div");
    table.className = "card mt-4";
    table.innerHTML = `
        <div class="card-header bg-primary text-white"><i class="fas fa-chart-bar me-2"></i>Division-wise Missing Persons</div>
        <div class="card-body">
            <table class="table">
                <thead>
                    <tr><th>Division</th><th>Count</th></tr>
                </thead>
                <tbody id="divisionBody"></tbody>
            </table>
        </div>
    `;
    container.appendChild(table);

    try {
        const divisions = await contract.methods.getAllDivisionWiseMissingCounts().call({ from: account });
        const divisionBody = document.getElementById("divisionBody");
        divisions.forEach(division => {
            const [name, count] = division.split(": ");
            const row = document.createElement("tr");
            row.innerHTML = `<td>${name}</td><td>${count}</td>`;
            divisionBody.appendChild(row);
        });
    } catch (error) {
        showError("Error loading divisions: " + error.message);
    }
});