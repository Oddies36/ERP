from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Categorie, Article, TVA_Categorie_Pays
from clients.models import Pays
from .serializers import CategorySerializer, ArticleSerializer, TVACategoriePaysSerializer

@api_view(['GET'])
def get_category(request):
  categories = Categorie.objects.all()
  serializer = CategorySerializer(categories, many=True)
  return Response(serializer.data, status=200)

@api_view(['GET'])
def get_articles(request):
  articles = Article.objects.all()
  serializer = ArticleSerializer(articles, many=True)
  return Response(serializer.data, status=200)

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
  
@api_view(['GET'])
def get_tva(request, pays, categorie, tva_entreprise):

  print(pays)
  print(categorie)
  print(tva_entreprise)

  pays = Pays.objects.get(pays=pays)
  categorie = Categorie.objects.get(id=categorie)
  tva = TVA_Categorie_Pays.objects.get(pays=pays, categorie=categorie)



  if tva_entreprise and pays.pays != "Belgique":
    tva.tva = '0.00'
    
  print(f"TVA {tva.tva}")

  serializer = TVACategoriePaysSerializer(tva)
  print("Resultat zebi: ")
  print(serializer.data)


  return Response(serializer.data, status=200)



