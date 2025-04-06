# Project-IDE: Real-Time Collaboration in VS Code

## Overview

**Project-IDE** is a powerful **VS Code extension** designed to bring real-time collaboration, live code sharing, and seamless project development directly into your favorite code editor. It transforms VS Code into a collaborative workspace where developers can work together on the same files, share code, and track changes in real-time.

This project started as a **web-based IDE** but has now evolved into a **VS Code extension** to provide a more integrated and developer-friendly experience.

---

## Features

### Current Features:
- **Live Collaboration**: See other users' edits in real-time with color-coded highlights.
- **Multi-User Editing**: Collaborate with multiple developers on the same files.
- **Cursor Sharing**: Track collaborators' cursor positions for better coordination.
- **WebSocket-Based Sync**: Instant updates for code changes, cursor movements, and more.
- **OAuth Integration**: Secure authentication via Google and GitHub.
- **Session Management**: Create, join, and leave collaboration sessions seamlessly.
- **Error Handling**: Robust error handling for WebSocket connections and session management.

### Planned Features:
- **File Sharing**: Share selected files or entire GitHub repositories with collaborators.
- **Video/Audio Calls**: Enable instant communication via WebRTC or Jitsi.
- **GitLens-Like Tracking**: View detailed contributions and corrections made by collaborators.
- **Advanced Project Management**: Add task tracking, issue management, and more.
- **Offline Collaboration**: Enable collaboration even when disconnected, with automatic sync when reconnected.

---

## How It Works

1. **Start a Session**: A user initiates a collaboration session via the extension.
2. **Invite Collaborators**: Share the session ID or invite collaborators directly.
3. **Real-Time Collaboration**: Collaborators join the session and can edit files, view changes, and track cursor movements in real-time.
4. **Code Sync**: All changes are synced instantly using WebSockets.
5. **Session Management**: Users can leave sessions, and sessions are automatically cleaned up when inactive.

---

## What I Have Done

- **Migrated from Web-Based to VS Code Extension**: The project was initially a web-based IDE but has been reimagined as a VS Code extension for better integration and usability.
- **Built a Robust Backend**: Developed a Node.js-based backend with WebSocket support for real-time communication.
- **Implemented OAuth Authentication**: Added secure login via Google and GitHub for user authentication.
- **Error Handling and Reconnection Logic**: Ensured stability with automatic reconnection for WebSocket connections.

---

## What I Am Working On

- **Improving the User Interface**: Enhancing the extension's UI/UX for better usability and clarity.
- **File Sharing**: Adding the ability to share files and folders directly within the collaboration session.
- **Session Persistence**: Ensuring sessions persist across VS Code restarts.
- **Testing and Debugging**: Writing comprehensive unit tests and fixing bugs to ensure a stable experience.
- **Developing Core Collaboration Features**: Real-time code sharing, cursor tracking, and session management.

---

## What I Will Make Ultimately

The ultimate goal of **Project-IDE** is to create a **seamless, real-time collaborative development environment** within VS Code. Here's what the final product will look like:

- **Complete Collaboration Suite**: Real-time editing, file sharing, and communication tools (video/audio calls).
- **Advanced Git Integration**: Track changes, view commit histories, and resolve merge conflicts collaboratively.
- **Self-Hosted Option**: Allow users to host their own collaboration server for privacy and control.
- **Cross-Platform Support**: Ensure compatibility with all major operating systems and VS Code versions.

---

## Installation

1. Open **VS Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X`).
3. Search for **Project-IDE** (once published).
4. Click **Install**.
5. Activate the extension and start collaborating!

---

## Prerequisites

- **VS Code** installed on your machine.
- **Node.js** (for backend setup if required).
- **npm** (for managing dependencies).

---

## Development Setup

### Backend Setup:
```bash
# Clone the repository
git clone https://github.com/aditya-8-88/Project-IDE.git
cd Project-IDE/server

# Install dependencies
npm install

# Start the server
cd src/ && node server.js
```

### Frontend (VS Code Extension) Setup:
```bash
# Navigate to the extension folder
cd ../Frontend/extension

# Install dependencies
npm install

# Build the extension
npm run build

# Launch the extension in VS Code
code .
```

## Contributions
Contributions are welcome! Here's how you can help:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

## Contact
For questions, suggestions, or feedback, feel free to reach out:

- **Email**: adityapratapsingh12b05@gmail.com
- **GitHub**: aditya-8-88