from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, emit
import random
import string

# -------------------- APP SETUP --------------------
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode="eventlet")

# -------------------- DATA STRUCTURE --------------------
"""
rooms = {
    "AB12CD": {
        "admin": "Aaryan",
        "users": ["Aaryan", "Rahul"]
    }
}
"""
rooms = {}

# -------------------- UTILITIES --------------------
def generate_room_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms:
            return code

# -------------------- ROUTES --------------------
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/create_room', methods=['POST'])
def create_room():
    room_code = generate_room_code()

    rooms[room_code] = {
        "admin": None,   # will be set when first user joins
        "users": []
    }

    return redirect(url_for('room', room_code=room_code))

@app.route('/room/<room_code>')
def room(room_code):
    if room_code not in rooms:
        return "Room does not exist!", 404
    return render_template('room.html', room_code=room_code)

# -------------------- SOCKET EVENTS --------------------

@socketio.on('join')
def handle_join(data):
    username = data.get('username')
    room_code = data.get('room')

    if not username or room_code not in rooms:
        return

    join_room(room_code)

    # First user becomes admin
    if not rooms[room_code]["users"]:
        rooms[room_code]["admin"] = username

    rooms[room_code]["users"].append(username)

    emit(
        'user_joined',
        {
            'users': rooms[room_code]["users"],
            'admin': rooms[room_code]["admin"]
        },
        room=room_code
    )

    emit(
        'chat_message',
        {'username': 'System', 'message': f'{username} joined the room.'},
        room=room_code
    )

@socketio.on('leave')
def handle_leave(data):
    username = data.get('username')
    room_code = data.get('room')

    if room_code not in rooms:
        return

    leave_room(room_code)

    if username in rooms[room_code]["users"]:
        rooms[room_code]["users"].remove(username)

        emit(
            'chat_message',
            {'username': 'System', 'message': f'{username} left the room.'},
            room=room_code
        )

    # 🔥 AUTO DELETE ROOM IF EMPTY
    if not rooms[room_code]["users"]:
        rooms.pop(room_code)
        return

    emit(
        'user_left',
        {
            'users': rooms[room_code]["users"]
        },
        room=room_code
    )

@socketio.on('delete')
def handle_delete(data):
    username = data.get('username')
    room_code = data.get('room')

    if room_code not in rooms:
        return

    # 🔐 ADMIN CHECK
    if rooms[room_code]["admin"] != username:
        emit(
            'chat_message',
            {'username': 'System', 'message': 'Only admin can delete the room.'},
            room=room_code
        )
        return

    emit(
        'chat_message',
        {'username': 'System', 'message': 'Room deleted by admin.'},
        room=room_code
    )

    emit(
        'room_deleted',
        {'room': room_code},
        room=room_code
    )

    rooms.pop(room_code)

@socketio.on('send_message')
def handle_message(data):
    username = data.get('username')
    room_code = data.get('room')
    message = data.get('message')

    if room_code not in rooms or not message:
        return

    emit(
        'chat_message',
        {'username': username, 'message': message},
        room=room_code
    )

# -------------------- RUN SERVER --------------------
if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)
