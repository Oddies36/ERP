from django.urls import path
from .views import new_facture, get_factures

urlpatterns = [
    path('new-facture/', new_facture, name='new-facture'),
    path('get-factures/', get_factures, name='get-factures')
]