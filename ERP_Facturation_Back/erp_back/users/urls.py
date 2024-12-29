from django.contrib import admin
from django.urls import path, include
from .views import login_view, create_user, validate_token

urlpatterns = [
    path('login/', login_view, name='login'),
    path('create-user/', create_user, name='create-user'),
    path('validate-token/', validate_token, name='validate-token'),
]