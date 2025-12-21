// room.js
// Handles all real-time room logic using Socket.IO

const socket = io();

let username = "";
let joined = false;

// Elements
const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");
const usersList = document.getElementById("usersList");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const leaveBtn = document.getElementById("leaveBtn");
const deleteBtn = document.getElementById("deleteBtn");

const chatBox = document.getElementById("chatBox");

// ---------------- JOIN ROOM ----------------
joinBtn.addEventListener("click", () => {
    if (joined) return;

    const name = usernameInput.value.trim();
    if (!name) {
        alert("Please enter a username");
        return;
    }

    username = name;
    socket.emit("join", { username, room: ROOM_CODE });

    joined = true;

    // Lock username after join
    usernameInput.disabled = true;
    joinBtn.disabled = true;
    joinBtn.innerText = "Joined";
});

// ---------------- SEND MESSAGE ----------------
sendBtn.addEventListener("click", () => {
    if (!joined) return;

    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit("send_message", {
        username,
        room: ROOM_CODE,
        message
    });

    messageInput.value = "";
});

// Enter key support
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// ---------------- LEAVE ROOM ----------------
leaveBtn.addEventListener("click", () => {
    if (joined) {
        socket.emit("leave", { username, room: ROOM_CODE });
    }
    window.location.href = "/";
});

// ---------------- DELETE ROOM (ADMIN ONLY BACKEND) ----------------
deleteBtn.addEventListener("click", () => {
    if (!joined) return;

    const confirmDelete = confirm("Are you sure you want to delete the room?");
    if (!confirmDelete) return;

    socket.emit("delete", { username, room: ROOM_CODE });
});

// ---------------- SOCKET EVENTS ----------------

// Update user list when someone joins
socket.on("user_joined", (data) => {
    usersList.innerHTML = "";
    data.users.forEach((u) => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
});

// Update user list when someone leaves
socket.on("user_left", (data) => {
    usersList.innerHTML = "";
    data.users.forEach((u) => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
});

// Receive chat messages
socket.on("chat_message", (data) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Room deleted (admin action or auto-delete)
socket.on("room_deleted", () => {
    alert("Room has been deleted");
    window.location.href = "/";
});
