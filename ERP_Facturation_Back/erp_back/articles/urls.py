from django.contrib import admin
from django.urls import path, include
from .views import get_category

urlpatterns = [
    path('get-category/', get_category, name='get-category'),
]