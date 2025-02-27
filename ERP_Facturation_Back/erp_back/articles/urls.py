from django.contrib import admin
from django.urls import path, include
from .views import get_category, add_article, get_articles, get_tva, add_article_quantity

urlpatterns = [
    path('get-category/', get_category, name='get-category'),
    path('add-article/', add_article, name='add-article'),
    path('get-articles/', get_articles, name='get-articles'),
    path('get-tva/<str:pays>/<str:categorie>/<str:tva_entreprise>/', get_tva, name='get-tva'),
    path('add/<int:id_article>/', add_article_quantity, name='add-article-quantity')

]