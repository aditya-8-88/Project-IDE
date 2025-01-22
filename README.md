# Project-IDE
The project is about making some kind of enhancement to current IDEs. It can be some feature on top of it. Complete readme file will be released after final build.


## Note
- **Python version** - ```3.12.8```
- The documentation will evolve as the project progresses, focusing on one task at a time.
- Ensure all dependencies are installed as specified in the ```requirements.txt``` file for smooth backend operation.


## Features
- **Web-Based IDE:** Access the IDE directly through a web browser.
- **Resource Utilization:** Leverages system resources for code execution using Docker containers.


## Project Timeline
The project development follows a structured timeline:

1. **Website for Code Compilation**
    - **Frontend Setup:** Build an interactive and user-friendly interface.
    - **Backend Setup:** Implement the backend using Django.
    - **Write Dockerfiles:** Configure Dockerfiles for supported programming languages.
    - **Backend-Frontend Integration:** Establish communication between the frontend and backend.
    - **Logging and Error Handling:** Implement robust logging and error-handling mechanisms.
    - **Database Integration:** Store user data or compilation history.
    - **Testing:** Validate APIs and Docker integration thoroughly.
    - **Deployment:** Use Docker Compose for efficient deployment.

2. **Future Enhancements**


## Docker initialization
To enable the backend functionality, ensure Docker is installed and running on your system.

1. **Install Docker:** Follow installation instructions for your platform from Docker's official site.
2. **Start Docker Service:** Use the following commands:
    - **Linux:** ```sudo systemctl start docker```
    - **Windows/Mac:** Start Docker Desktop.


## How to Run the Project

### Start Frontend
```bash
cd Frontend && python -m http.server 3000 && cd ..
```

### Start Backend
```bash
cd Backend
python -m venv env
source env/bin/activate    #.\env\Scripts\activate  # for windows
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```


## Contributions
Contributions are welcome! Feel free to fork the repository, open issues, or submit pull requests.


## License
This project is licensed under the MIT License.