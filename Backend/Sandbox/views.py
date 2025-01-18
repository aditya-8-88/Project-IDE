from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .code_executor.docker_manager import DockerManager


# Create your views here.

@api_view(['POST'])
def execute_code(request):
    code = request.data.get('code')
    language = request.data.get('language')
    
    docker_manager = DockerManager()
    output = docker_manager.execute(code, language)
    
    # output = f"Received {language} code: {code}"
    
    return Response({
        'output': output,
        'language': language
    })