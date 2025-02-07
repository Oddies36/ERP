from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Categorie, Article, TVA_Categorie_Pays
from clients.models import Pays
from .serializers import CategorySerializer, ArticleSerializer, TVACategoriePaysSerializer
from django.shortcuts import get_object_or_404

# api qui va prendre la liste des categories. Utilisé pour la création d'un article
@api_view(['GET'])
def get_category(request):
  categories = Categorie.objects.all()
  serializer = CategorySerializer(categories, many=True)
  return Response(serializer.data, status=200)

# api qui va prendre la liste des articles. Utilisé dans la création et la modification des Factures
@api_view(['GET'])
def get_articles(request):
  articles = Article.objects.all()
  serializer = ArticleSerializer(articles, many=True)
  return Response(serializer.data, status=200)

# api qui va écrire un article dans la DB
@api_view(['POST'])
def add_article(request):

  serializer = ArticleSerializer(data=request.data)

  if serializer.is_valid():
    serializer.save()
    
    return Response({
      "success": True,
      "message": "Article créé avec succès",
      "data": serializer.data
      }, status=201)
  
  else:
    return Response({
      "success": False,
      "message": "Erreur lors de la création de l'article",
      "errors": serializer.errors
    }, status=400)

# api qui va chercher le taux de TVA par rapport au pays et la catégorie d'un article. Si tva_entreprise n'est pas null, la TVA sera 0% si le pays n'est pas Belgique
@api_view(['GET'])
def get_tva(request, pays, categorie, tva_entreprise):

  pays = Pays.objects.get(pays=pays)
  categorie = Categorie.objects.get(id=categorie)
  tva = TVA_Categorie_Pays.objects.get(pays=pays, categorie=categorie)


  if tva_entreprise not in [None, "", "None", "null"] and pays.pays != "Belgique":
    tva.tva = '0.00'
    
  serializer = TVACategoriePaysSerializer(tva)

  return Response(serializer.data, status=200)

#api qui gère l'ajout des articles
@api_view(['PATCH'])
def add_article_quantity(request, id_article):
  new_qty_stock = request.data.get("qty_stock")
  new_qty_stock = int(new_qty_stock)
  article = get_object_or_404(Article, id=id_article)


  serializer = ArticleSerializer(article, data={"qty_stock": new_qty_stock}, partial=True)

  if serializer.is_valid():
    serializer.save()

    return Response(serializer.data, status=200)
  
  return Response(serializer.errors, status=400)


