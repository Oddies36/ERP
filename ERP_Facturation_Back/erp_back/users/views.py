from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime
from rest_framework.response import Response
from .serializers import UserSerializer, LoginSerializer

@api_view(['POST'])
def login_view(request):
  serializer = LoginSerializer(data=request.data)

  if serializer.is_valid():
    username = serializer.validated_data.get('username')
    password = serializer.validated_data.get('password')

    user = authenticate(request, username = username, password = password)

    if user is not None:
      refresh = RefreshToken.for_user(user)
      return Response({
        "success": True,
        "message": "Login successful",
        "username": user.username,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
      }, status = 200)
    else:
      return Response({
        "message": "User ou mot de passe invalide"
      }, status = 401)
  else:
      return Response({
          "success": False,
          "message": "Validation échouée",
          "errors": serializer.errors
      }, status=400)
  
@api_view(['POST'])
def create_user(request):
  serializer = UserSerializer(data=request.data)

  if serializer.is_valid():
    serializer.save()
    
    return Response({
      "success": True,
      "message": "Utilisateur créé avec succès",
      "data": serializer.data
      }, status=201)
  
  else:
    return Response({
      "success": False,
      "message": "Erreur lors de la création de l'utilisateur",
      "errors": serializer.errors
    }, status=400)
  
@api_view(['POST'])
def validate_token(request):

  token = request.data.get("token")

  try:
    AccessToken(token)
    return Response({"valid": True})
  except AuthenticationFailed:
    return Response({"valid": False}, status=401)