from django.urls import path
from .views import new_facture, get_factures, get_numero_facture, get_articles_facture, change_facture_statut, edit_facture

urlpatterns = [
    path('new-facture/', new_facture, name='new-facture'),
    path('get-factures/', get_factures, name='get-factures'),
    path('facture/<str:numero_facture>/', get_numero_facture, name='get-numero-facture'),
    path('facture/update-statut/<str:numero_facture>/', change_facture_statut, name='change-facture-statut'),
    path('facture/edit/<str:numero_facture>/', edit_facture, name='edit-facture'),
    path('facture/<str:numero_facture>/details/', get_articles_facture, name='get-articles-facture')
]