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

// JOIN
joinBtn.addEventListener("click", () => {
    if (joined) return;

    const name = usernameInput.value.trim();
    if (!name) return alert("Enter username");

    username = name;
    socket.emit("join", { username, room: ROOM_CODE });

    joined = true;
    usernameInput.disabled = true;
    joinBtn.disabled = true;
    joinBtn.innerText = "Joined";
});

// SEND MESSAGE
sendBtn.addEventListener("click", () => {
    if (!joined) return;

    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit("send_message", { username, room: ROOM_CODE, message });
    messageInput.value = "";
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// LEAVE
leaveBtn.addEventListener("click", () => {
    if (joined) {
        socket.emit("leave", { username, room: ROOM_CODE });
    }
    window.location.href = "/";
});

// DELETE (admin only backend)
deleteBtn.addEventListener("click", () => {
    if (!joined) return;
    if (!confirm("Delete this room?")) return;
    socket.emit("delete", { username, room: ROOM_CODE });
});

// SOCKET EVENTS
socket.on("user_joined", (data) => {
    usersList.innerHTML = "";
    data.users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
});

socket.on("user_left", (data) => {
    usersList.innerHTML = "";
    data.users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        usersList.appendChild(li);
    });
});

socket.on("chat_message", (data) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("room_deleted", () => {
    alert("Room deleted");
    window.location.href = "/";
});

// COPY ROOM CODE
const copyBtn = document.getElementById("copyCodeBtn");
const roomCodeText = document.getElementById("roomCode");

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(roomCodeText.innerText);
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy", 1500);
});
