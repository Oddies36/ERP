from rest_framework.decorators import api_view
from rest_framework.response import Response
from factures.models import Facture, DetailsFacture
from clients.models import Client, Type_Adresse, Adresse
from articles.models import Article, TVA_Categorie_Pays, Mouvements_Stock
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from .serializers import FactureSerializer, DetailsFactureSerializer
from django.shortcuts import get_object_or_404

import traceback


#api qui créé une nouvelle facture et fait également les calculs des prix en backend
@api_view(['POST'])
def new_facture(request):

    data = request.data

    

    try:
        #On prend le bon client avec l'ID
        client = Client.objects.get(id=data['client_id'])

        #On prend l'objet pour le type d'adresse, qui est la facturation
        billing_type = Type_Adresse.objects.filter(type_adresse="Facturation").first()
        if not billing_type:
            return Response({"error": "Le type 'facturation' n'a pas été trouvé."}, status=404)

        #On va chercher l'adresse de facturation pour le client
        billing_address = Adresse.objects.filter(clients=client, type_adresses=billing_type).first()

        if not billing_address:
            return Response({"error": "Pas d'adresse de facturation trouvé pour ce client."}, status=404)



        #On va faire les calculs en backend
        #On créé les variables qui sont les totaux pour la facture en dehors de notre boucle
        prix_htva_total = Decimal(0)
        montant_tva_total = Decimal(0)
        prix_ttc_total = Decimal(0)

        #Dans data, nous avons un field nommé 'articles'. On va parcourir cette liste qui contient chaque article qu'on a choisi
        for article_data in data['articles']:
            article = Article.objects.get(id=article_data['id'])
            quantity = Decimal(article_data['quantity'])
            #On va chercher la remise dans article et si elle n'existe pas c'est 0 par défaut ('remise', 0), et est converti en Decimal pour la précision
            #quantize est utilisé pour limiter les décimales à 2 après la virgule et ROUND_HALF_UP est utilisé pour arrondir vers le haut de 5 à 9 en vers le bas pour 1 à 4
            remise = Decimal(article_data.get('remise', 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)  # Default to 0

            #Vérifie s'il y assez de stock pour l'article. Est déjà vérifie en front mais c'est une vérification en plus
            if article.qty_stock < quantity:
                return Response(
                    {"error": f"Stock insuffisant pour {article.article}. Il en reste: {article.qty_stock}, ce qui est demandé: {quantity}"},
                    status=400,
                )

            #On prend le prix htva de l'article et on "serialize" en quelques sortes pour être sur que les données sont exacte.
            #C'est dans le cas ou un prix à 3 décimales a été donné
            prix_htva = Decimal(article.prix_htva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #On commence par appliquer la remise sur le prix htva de l'article
            prix_remise = (prix_htva * (Decimal(1) - remise / 100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #On va chercher le taux de TVA pour l'article et pour le pays du client
            pays = billing_address.code_postal.ville.pays
            categorie = article.categorie
            tva_rate = Decimal(0)

            #Si le client est une entreprise qui ne se trouve pas en Belgique, la TVA est 0%
            if client.tva_entreprise and pays.pays != "Belgique":
                tva_rate = Decimal(0)
            else:
                #Cherche la TVA en fonction de la catégorie et le pays
                tva_entry = TVA_Categorie_Pays.objects.filter(pays=pays, categorie=categorie).first()
                if tva_entry:
                    tva_rate = Decimal(tva_entry.tva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #On calcule la TVA pour l'article remisé
            montant_tva_per_item = (prix_remise * tva_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            #On ajoute cette TVA pour prix remisé ce qui fait la TTC pour cet article
            prix_ttc_per_item = (prix_remise + montant_tva_per_item).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #On calcule le total prix htva pour l'article en fonction de la quantité choisie. Sera utilisé pour detailsfacture
            total_htva_item = (prix_remise * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            #On fait pareil pour le total TVA de cette ligne
            total_tva_item = (montant_tva_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            #On fait pareil pour le total TTC de cette ligne
            total_ttc_item = (prix_ttc_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #On va mettre à jour les variables en dehors de la boucle pour mettre à jour le prix final de la facture
            prix_htva_total += total_htva_item
            montant_tva_total += total_tva_item
            prix_ttc_total += total_ttc_item

            

            #On enleve le nombre d'articles choisi de notre stock et on sauvegarde
            article.qty_stock -= int(quantity)
            article.save()

            #On créé la ligne mouvements
            Mouvements_Stock.objects.create(
                article=article,
                quantite=-int(quantity),
                type_mouvement="Vente",
                description_mouvement=f"Vente associée à la facture {data.get('facture_id') or 'nouvelle facture'}",
            )

        #Avant de créer les detailsfacture, on doit créer la facture même et on insère les totaux déjà calculés
        #Par défaut, la date d'écheance est la date de la création de la facture
        date_echeance = datetime.now().date()
        rappel1 = date_echeance + timedelta(days=7)
        rappel2 = rappel1 + timedelta(days=7)
        rappel3 = rappel2 + timedelta(days=7)

        print("j'arrive ici 1")

        #Création de la facture
        facture = Facture.objects.create(
            client=client,
            date_echeance=date_echeance,
            prix_htva=prix_htva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            montant_tva=montant_tva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            prix_ttc=prix_ttc_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            rappel1=rappel1,
            rappel2=rappel2,
            rappel3=rappel3,
            statut="nouveau",
            est_comptabilise=False,
        )

        print("j'arrive ici 2")

        #On va créer les detailsfacture
        #On refait une boucle sur les articles en tenant compte de l'index
        for index, article_data in enumerate(data['articles'], start=1):

            #On refait les mêmes calculs que juste avant
            article = Article.objects.get(id=article_data['id'])
            quantity = Decimal(article_data['quantity'])
            remise = Decimal(article_data.get('remise', 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)  # Default to 0

            prix_htva = Decimal(article.prix_htva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_remise = (prix_htva * (Decimal(1) - remise / 100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            tva_rate = Decimal(0)
            tva_entry = TVA_Categorie_Pays.objects.filter(pays=billing_address.code_postal.ville.pays,categorie=article.categorie).first()

            if tva_entry:
                tva_rate = Decimal(tva_entry.tva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            montant_tva_per_item = (prix_remise * tva_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_ttc_per_item = (prix_remise + montant_tva_per_item).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            line_htva = (prix_remise * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            #Création d'un detailsfacture
            DetailsFacture.objects.create(
                facture=facture,
                article=article,
                numero_ligne=index,
                quantite=quantity,
                prix_article_htva=article.prix_htva,
                montant_promo=remise,
                montant_tva=montant_tva_per_item,
                prix_article_ttc=prix_ttc_per_item,
                tva=tva_rate,
                prix_total_htva=line_htva
            )

        return Response({
            "message": "Facture créé avec succès", 
            "facture_id": facture.id,
            "total_htva": str(prix_htva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "total_tva": str(montant_tva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "total_ttc": str(prix_ttc_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "rappel1": rappel1,
            "rappel2": rappel2,
            "rappel3": rappel3
        })

    except Exception as e:
        print("Erreur lors de la création de la facture")
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

#api pour chercher la liste des factures
@api_view(['GET'])
def get_factures(request):
    factures = Facture.objects.all()
    serializer = FactureSerializer(factures, many=True)

    return Response(serializer.data)

#api pour cherche une facture avec le numéro de la facture
@api_view(['GET'])
def get_numero_facture(request, numero_facture):

    facture = Facture.objects.get(numero_facture=numero_facture)
    serializer = FactureSerializer(facture)

    return Response(serializer.data)

#api pour mettre à jour le statut d'une facture. Pour faire en sorte qu'elle est comptabilisé dans la DB
@api_view(['PUT'])
def change_facture_statut(request, numero_facture):
    facture = Facture.objects.get(numero_facture=numero_facture)
    serializer = FactureSerializer(facture, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

#api qui va chercher les details facture en fonction du numéro de facture
@api_view(['GET'])
def get_articles_facture(request, numero_facture):

    facture = Facture.objects.get(numero_facture=numero_facture)
    detailsFacture = DetailsFacture.objects.filter(facture_id=facture)

    serializer = DetailsFactureSerializer(detailsFacture, many=True)

    return Response(serializer.data)

#api pour modifier une facture. Ressemble fort à la création d'une nouvelle facture avec des petites différences
@api_view(['PUT'])
def edit_facture(request, numero_facture):
    data = request.data
    try:
        #Cherche la facture et retourne 404 si pas trouvé. C'est une manière plus courte que faire un get() et faire un if pour vérifier si la facture existe
        facture = get_object_or_404(Facture, numero_facture=numero_facture)

        #On reprend le client dans le cas où il a changé et on l'assigne à l'objet facture
        client_id = data['client_id']
        client = Client.objects.get(id=client_id)
        facture.client = client

        #On reprend l'adresse aussi dans le cas où le client change
        billing_type = Type_Adresse.objects.filter(type_adresse="Facturation").first()
        if not billing_type:
            return Response({"error": "Le type 'facturation' n'a pas été trouvé."}, status=404)
        billing_address = Adresse.objects.filter(clients=client, type_adresses=billing_type).first()
        if not billing_address:
            return Response({"error": "Pas d'adresse de facturation trouvé pour ce client."}, status=404)

        #On va remettre les articles qu'on a déjà dans notre facture en stock. Après on va les remettre en fonction de la facture sauvegardé
        old_lines = DetailsFacture.objects.filter(facture=facture)
        for old_line in old_lines:
            article = old_line.article
            old_qty = old_line.quantite

            #On va incrementer le stock pour chaque ligne (detailsreservation)
            article.qty_stock += int(old_qty)
            article.save()

            #On créé une ligne de mouvement pour la remise en stock
            Mouvements_Stock.objects.create(
                article=article,
                quantite=+int(old_qty),
                type_mouvement="Annulation",
                description_mouvement=f"Annulation/mise à jour de la ligne #{old_line.numero_ligne} pour la facture {facture.numero_facture}"
            )

        #Quand le stock est ok, on supprime les detailsreservation. old_lines contient les objets de la DB
        old_lines.delete()

        #Comme pour la création, on va refaire les calculs pour les nouvelles lignes
        prix_htva_total = Decimal(0)
        montant_tva_total = Decimal(0)
        prix_ttc_total = Decimal(0)

        articles_data = data['articles']
        for index, article_data in enumerate(articles_data, start=1):
            article = Article.objects.get(id=article_data['id'])
            quantity = Decimal(article_data['quantity'])
            remise = Decimal(article_data.get('remise', 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            if article.qty_stock < quantity:
                return Response(
                    {"error": f"Stock insuffisant pour {article.article}. Il en reste: {article.qty_stock}, ce qui est demandé: {quantity}"},
                    status=400
                )

            prix_htva = Decimal(article.prix_htva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_remise = (prix_htva * (Decimal(1) - remise/100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            pays = billing_address.code_postal.ville.pays
            categorie = article.categorie
            tva_rate = Decimal(0)

            if client.tva_entreprise and pays.pays != "Belgique":
                tva_rate = Decimal(0)
            else:
                tva_entry = TVA_Categorie_Pays.objects.filter(pays=pays, categorie=categorie).first()
                if tva_entry:
                    tva_rate = Decimal(tva_entry.tva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            montant_tva_per_item = (prix_remise * tva_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_ttc_per_item = (prix_remise + montant_tva_per_item).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            total_htva_item = (prix_remise * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_tva_item = (montant_tva_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_ttc_item = (prix_ttc_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            prix_htva_total += total_htva_item
            montant_tva_total += total_tva_item
            prix_ttc_total += total_ttc_item

            article.qty_stock -= int(quantity)
            article.save()

            Mouvements_Stock.objects.create(
                article=article,
                quantite=-int(quantity),
                type_mouvement="Vente",
                description_mouvement=f"Mise à jour de la facture {numero_facture}, ligne {index}"
            )

            DetailsFacture.objects.create(
                facture=facture,
                article=article,
                numero_ligne=index,
                quantite=quantity,
                prix_article_htva=article.prix_htva,
                montant_promo=remise,
                montant_tva=montant_tva_per_item,
                prix_article_ttc=prix_ttc_per_item,
                tva=tva_rate,
                prix_total_htva=total_htva_item
            )

        facture.prix_htva = prix_htva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        facture.montant_tva = montant_tva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        facture.prix_ttc = prix_ttc_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        #Normalement on n'en a pas besoin mais peut être pour du développement futur, si le statut change avec une modification on le gère ici
        new_statut = data.get('statut')
        if new_statut:
            facture.statut = new_statut

        facture.save()

        return Response({
            "message": "Facture mis à jour",
            "facture_id": facture.id,
            "total_htva": str(facture.prix_htva),
            "total_tva": str(facture.montant_tva),
            "total_ttc": str(facture.prix_ttc),
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
