from django.contrib import admin
from django.urls import path, include
from .views import get_clients, create_client

urlpatterns = [
    path('get-clients', get_clients, name='get-clients'),
    path('create-client', create_client, name='create-client'),
]