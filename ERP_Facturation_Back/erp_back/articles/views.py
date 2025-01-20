from django.shortcuts import render
from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime
from rest_framework.response import Response
from .models import Categorie
from .serializers import CategorySerializer

@api_view(['GET'])
def get_category(request):
  categories = Categorie.objects.all()
  serializer = CategorySerializer(categories, many=True)
  print(serializer.data)
  return Response(serializer.data, status=200)
