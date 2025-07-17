function toggleProceedButton() {
    const username = document.getElementById("security-username").value.trim();
    const pin = document.getElementById("security-password").value.trim();
    const proceedButton = document.getElementById("login-button");

    proceedButton.disabled = !(username && pin);
}

window.onload = function() {
    document.getElementById("login-button").disabled = true;
};

function GeneratePIN() {
    const username = document.getElementById("security-username").value;

    if (!username) {
        alert("Please enter your username.");
        return;
    }

    fetch('/api/generate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Verification PIN has been sent to your email.");
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error sending PIN:', error);
        alert("Something went wrong. Please try again.");
    });
}

function CheckVPIN() {
    const username = document.getElementById("security-username").value.trim();
    const pin = document.getElementById("security-password").value.trim();

    if (!username || !pin) {
        alert("Please enter both your username and verification PIN.");
        return;
    }

    fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = "SecurityQuestions.html?mode=forgot";
        } else {
            alert("Invalid or expired PIN. Please try again or regenerate.");
        }
    })
    .catch(err => {
        console.error("PIN verification failed:", err);
        alert("Error verifying PIN.");
    });
}

