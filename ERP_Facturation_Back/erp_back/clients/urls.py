from django.contrib import admin
from django.urls import path, include
from .views import get_clients, new, get_pays

urlpatterns = [
    path('get-clients/', get_clients, name='get-clients'),
    path('new/', new, name='new'),
    path('get-pays/', get_pays, name='get-pays'),
]