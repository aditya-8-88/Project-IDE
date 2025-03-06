# Project-IDE

## Overview
Project-IDE is a **VS Code extension** that enables real-time collaboration, live code sharing, and seamless project development within VS Code.

## Features
- **Live Collaboration:** See other users' code edits in real-time with color-coded highlights.
- **Multi-User Editing:** Work together on the same files.
- **GitLens-like Tracking:** View code corrections and contributions.
- **WebSockets for Sync:** Ensures instant updates.
- **File Sharing:** Share selected files or entire GitHub repositories.
- **Video Calls (Planned):** Toggle on/off for instant communication.

## Installation
1. Open VS Code.
2. Go to **Extensions** (Ctrl+Shift+X).
3. Search for **Project-IDE** (once published).
4. Click **Install**.
5. Activate the extension and start collaborating!

## How It Works
1. **User 1 requests collaboration access.**
2. **Server creates a session** and returns a unique room ID.
3. **User 1 invites User 2** via WebSockets.
4. **User 2 accepts/rejects the invite.**
5. **If accepted, files are shared, and real-time editing starts.**
6. **Users can see each other’s edits, cursor positions, and changes.**
7. **Code execution happens on users’ local machines.**

## Prerequisites
- **VS Code** installed
- **Python 3.12.8** (for backend setup if required)
- **Django, Django Channels** (WebSockets support)

## Setup (For Development)
```bash
# Clone the repo
git clone https://github.com/aditya-8-88/Project-IDE.git
cd Project-IDE

# Backend Setup
cd Backend
python -m venv env
source env/bin/activate  # Windows: .\env\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend Setup (VS Code Extension)
cd ../Extension
npm install
npm run build
```

## Future Enhancements
- **Better UI/UX for collaboration tracking.**
- **Self-hosted video/audio calls via WebRTC/Jitsi.**
- **Advanced project management features.**

## Contributions
Contributions are welcome! Fork the repo, create issues, and submit pull requests.

## License
This project is licensed under the **MIT License**.

