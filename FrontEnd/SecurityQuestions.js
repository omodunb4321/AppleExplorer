document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "forgot"; // Default fallback

    const existingQuestionGroup = document.getElementById("existing-question-group");
    const newQuestionGroup = document.getElementById("new-question-group");
    const confirmRow = document.getElementById("confirm-answer-row");

    if (mode === "first-time") {
        existingQuestionGroup.classList.add("d-none");
        newQuestionGroup.classList.remove("d-none");
        confirmRow.classList.remove("d-none");
    } else {
        existingQuestionGroup.classList.remove("d-none");
        newQuestionGroup.classList.add("d-none");
        confirmRow.classList.add("d-none");
    }
});
