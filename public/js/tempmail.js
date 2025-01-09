document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.getElementById("createButton");
    const checkButton = document.getElementById("checkButton");
    const contentButton = document.getElementById("contentButton");
    const deleteButton = document.getElementById("deleteButton");
    const result = document.getElementById("result");

    let tempEmail = {}; // Store temporary email details

    // Create Temporary Email
    createButton.addEventListener("click", async () => {
        result.innerHTML = "Generating email...";
        try {
            const response = await fetch("/api/tempmail/create");
            const data = await response.json();
            if (data.success) {
                tempEmail = data.result;
                result.innerHTML = `
                    <p><strong>Email:</strong> ${tempEmail.email}</p>
                    <button onclick="copyText('${tempEmail.email}')">Copy Email</button>
                `;
            } else {
                result.innerHTML = `<p style="color: red;">${data.result}</p>`;
            }
        } catch (error) {
            result.innerHTML = `<p style="color: red;">An error occurred while generating email.</p>`;
        }
    });

    // Check Emails
    checkButton.addEventListener("click", async () => {
        if (!tempEmail.username || !tempEmail.domain) {
            result.innerHTML = `<p style="color: red;">Generate an email first.</p>`;
            return;
        }
        result.innerHTML = "Checking for emails...";
        try {
            const response = await fetch(`/api/tempmail/check?username=${tempEmail.username}&domain=${tempEmail.domain}`);
            const data = await response.json();
            result.innerHTML = `<p>${data.result}</p>`;
        } catch (error) {
            result.innerHTML = `<p style="color: red;">An error occurred while checking emails.</p>`;
        }
    });

    // View Email Content
    contentButton.addEventListener("click", async () => {
        const emailId = prompt("Enter Email ID:");
        if (!emailId) {
            result.innerHTML = `<p style="color: red;">Email ID is required.</p>`;
            return;
        }
        if (!tempEmail.username || !tempEmail.domain) {
            result.innerHTML = `<p style="color: red;">Generate an email first.</p>`;
            return;
        }
        result.innerHTML = "Fetching email content...";
        try {
            const response = await fetch(`/api/tempmail/content?username=${tempEmail.username}&domain=${tempEmail.domain}&emailId=${emailId}`);
            const data = await response.json();
            if (data.success) {
                result.innerHTML = `
                    <p>${data.result}</p>
                    ${data.file ? `<a href="${data.file}" download>Download Attachment</a>` : ""}
                `;
            } else {
                result.innerHTML = `<p style="color: red;">${data.result}</p>`;
            }
        } catch (error) {
            result.innerHTML = `<p style="color: red;">An error occurred while fetching email content.</p>`;
        }
    });

    // Delete Temporary Email
    deleteButton.addEventListener("click", async () => {
        if (!tempEmail.username || !tempEmail.domain) {
            result.innerHTML = `<p style="color: red;">Generate an email first.</p>`;
            return;
        }
        result.innerHTML = "Deleting email...";
        try {
            const response = await fetch(`/api/tempmail/delete?username=${tempEmail.username}&domain=${tempEmail.domain}`);
            const data = await response.json();
            result.innerHTML = `<p>${data.message}</p>`;
        } catch (error) {
            result.innerHTML = `<p style="color: red;">An error occurred while deleting email.</p>`;
        }
    });
});

// Copy text function
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
alert("Copied to clipboard!");
    }).catch(err => {
        alert("Failed to copy: " + err);
    });
    }
