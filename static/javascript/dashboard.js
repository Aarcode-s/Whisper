// dashboard.js
// Handles ONLY dashboard behavior (join & create UX)

document.addEventListener("DOMContentLoaded", () => {

    // JOIN ROOM FORM
    const joinForm = document.querySelector("form[action='/join_room']");
    const roomInput = joinForm.querySelector("input[name='room_code']");

    joinForm.addEventListener("submit", (e) => {
        const code = roomInput.value.trim();

        // Basic validation
        if (!code) {
            e.preventDefault();
            alert("Please enter a room code");
            return;
        }

        // Normalize room code (backend-safe)
        roomInput.value = code.toUpperCase();
    });

    // CREATE ROOM FORM
    const createForm = document.querySelector("form[action='/create_room']");

    createForm.addEventListener("submit", () => {
        // Optional UX: disable button to prevent double submit
        const btn = createForm.querySelector("button");
        btn.disabled = true;
        btn.innerText = "Creating...";
    });

});
