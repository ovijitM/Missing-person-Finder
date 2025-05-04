document.addEventListener("DOMContentLoaded", async () => {
    if (!(await restrictAccess(2))) return; // Restrict to Investigators
    document.getElementById("logoutBtn").addEventListener("click", logout);

    const scheduleBody = document.getElementById("scheduleBody");
    const resultDiv = document.getElementById("scheduleResult");
    try {
        const schedule = await contract.methods.myFormattedSchedule().call({ from: account });
        scheduleBody.innerHTML = "";
        schedule.forEach(appointment => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${appointment.split(" ")[1].replace("#", "")}</td>
                             <td>${appointment.split(" with ")[1].split(" at ")[0]}</td>
                             <td>${appointment.split(" at ")[1].split(" (")[0]}</td>
                             <td>${appointment.includes("(Done)") ? "Completed" : "Pending"}</td>`;
            scheduleBody.appendChild(row);
        });
        if (schedule.length === 0) {
            resultDiv.innerText = "No appointments scheduled";
            resultDiv.className = "alert alert-info";
        }
    } catch (error) {
        resultDiv.innerText = "Error: " + error.message;
        resultDiv.className = "alert alert-danger";
    }
});