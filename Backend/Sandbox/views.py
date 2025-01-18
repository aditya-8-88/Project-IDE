from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

@api_view(['POST'])
def execute_code(request):
    code = request.data.get('code')
    language = request.data.get('language')
    
    # Here you'll add code execution logic later
    # For now, just echo back
    output = f"Received {language} code: {code}"
    
    return Response({
        'output': output,
        'language': language
    })