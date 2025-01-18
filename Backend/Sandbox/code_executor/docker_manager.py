import docker
from typing import Dict
import tempfile
import shlex
import os

class DockerManager:
    def __init__(self):
        self.client = docker.from_env()
        self.images = {
            'python': 'python:3.9-slim',
            'javascript': 'node:16-alpine',
            'java': 'openjdk:11-slim'
        }
    
    def execute(self, code: str, language: str) -> str:
        try:
            if language == 'java':
                with tempfile.NamedTemporaryFile(delete=False, suffix='.java') as temp_file:
                    temp_file.write(code.encode('utf-8'))
                    temp_file.flush()
                    temp_file_name = temp_file.name
                command = f'sh -c "javac /code/Main.java && java -cp /code Main"'
                volumes = {temp_file_name: {'bind': '/code/Main.java', 'mode': 'ro'}}
            else:
                command = self._get_run_command(language, code)
                volumes = None
            
            container = self.client.containers.run(
                self.images[language],
                command=command,
                volumes=volumes,
                remove=True,
                mem_limit='50m',
                network_disabled=True
            )
            return container.decode('utf-8')
        except docker.errors.ContainerError as e:
            return f"Execution error: {str(e)}"
        except docker.errors.ImageNotFound as e:
            return f"Image not found: {str(e)}"
        except docker.errors.APIError as e:
            return f"API error: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"
            
    def _get_run_command(self, language: str, code: str) -> str:
        commands = {
            'python': f'python -c {shlex.quote(code)}',
            'javascript': f'node -e {shlex.quote(code)}'
        }
        return commands.get(language, '')