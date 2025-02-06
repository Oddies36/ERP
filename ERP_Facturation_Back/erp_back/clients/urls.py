from django.urls import path
from .views import get_clients, new, get_pays, get_addresses_client, get_client_details

urlpatterns = [
    path('get-clients/', get_clients, name='get-clients'),
    path('get-clients/<int:id_client>', get_client_details, name='get-clients'),
    path('new/', new, name='new'),
    path('get-pays/', get_pays, name='get-pays'),
    path('<int:id_client>/addresses/', get_addresses_client, name='get_addresses_client')
]