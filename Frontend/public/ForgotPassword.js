function CheckVPIN() {
    // Validate the PIN here (you can add actual logic if needed)
    const username = document.getElementById("security-username").value;
    const pin = document.getElementById("security-password").value;

    if (username && pin) {
        // Redirect to security questions with "forgot" mode
        window.location.href = "SecurityQuestions.html?mode=forgot";
    } else {
        alert("Please enter both your username and verification PIN.");
    }
}