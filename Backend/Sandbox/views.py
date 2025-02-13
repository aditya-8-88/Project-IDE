from rest_framework.decorators import api_view
from rest_framework.response import Response
from .code_executor.docker_manager import DockerManager


@api_view(['POST'])
def execute_code(request):
    code = request.data.get('code')
    language = request.data.get('language')
    
    docker_manager = DockerManager()
    output = docker_manager.execute(code, language)

    return Response({
        'output': output,
        'language': language
    })