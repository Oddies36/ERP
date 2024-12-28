from django.shortcuts import render
from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def login_view(request):
  username = request.data.get('username')
  password = request.data.get('password')

  user = authenticate(request, username = username, password = password)

  if user is not None:
    refresh = RefreshToken.for_user(user)
    return JsonResponse({
      "message": "Login successful",
      "username": user.username,
      "refresh": str(refresh),
      "access": str(refresh.access_token),
    }, status = 200)
  else:
    return JsonResponse({
      "message": "User ou mot de passe invalide"
    }, status = 401)