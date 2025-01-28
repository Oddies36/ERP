from rest_framework.decorators import api_view
from rest_framework.response import Response
from factures.models import Facture, DetailsFacture
from clients.models import Client, Type_Adresse, Adresse
from articles.models import Article, TVA_Categorie_Pays, Mouvements_Stock
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from .serializers import FactureSerializer

@api_view(['POST'])
def new_facture(request):
    print("1. Function started")
    data = request.data
    print("2. Request data:", data)

    try:
        # Step 1: Fetch client
        client = Client.objects.get(id=data['client_id'])
        print(f"4. Client found: {client}")

        # Step 2: Fetch the billing address
        billing_type = Type_Adresse.objects.filter(type_adresse="Facturation").first()
        if not billing_type:
            return Response({"error": "Billing address type not found."}, status=404)

        billing_address = Adresse.objects.filter(
            clients=client, type_adresses=billing_type
        ).first()

        if not billing_address:
            return Response({"error": "No billing address found for the client."}, status=404)

        # Step 3: Perform article calculations
        prix_htva_total = Decimal(0)
        montant_tva_total = Decimal(0)
        prix_ttc_total = Decimal(0)

        for article_data in data['articles']:
            article = Article.objects.get(id=article_data['id'])
            quantity = Decimal(article_data['quantity'])

            # Check stock availability
            if article.qty_stock < quantity:
                return Response(
                    {"error": f"Insufficient stock for article {article.article}. Available: {article.qty_stock}, Requested: {quantity}"},
                    status=400,
                )

            prix_htva = Decimal(article.prix_htva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Fetch TVA rate
            pays = billing_address.code_postal.ville.pays
            categorie = article.categorie
            tva_rate = Decimal(0)

            if client.tva_entreprise and pays.pays != "Belgique":
                tva_rate = Decimal(0)
            else:
                tva_entry = TVA_Categorie_Pays.objects.filter(pays=pays, categorie=categorie).first()
                if tva_entry:
                    tva_rate = Decimal(tva_entry.tva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            montant_tva_per_item = (prix_htva * tva_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_ttc_per_item = (prix_htva + montant_tva_per_item).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            total_htva_item = (prix_htva * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_tva_item = (montant_tva_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_ttc_item = (prix_ttc_per_item * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            prix_htva_total += total_htva_item
            montant_tva_total += total_tva_item
            prix_ttc_total += total_ttc_item

            # Deduct stock and create a movement line
            article.qty_stock -= int(quantity)
            article.save()

            Mouvements_Stock.objects.create(
                article=article,
                quantite=-int(quantity),
                type_mouvement="Vente",
                description_mouvement=f"Vente associée à la facture {data.get('facture_id') or 'nouvelle facture'}",
            )

        # Step 4: Create the facture
        date_echeance = datetime.now().date() + timedelta(days=30)
        rappel1 = date_echeance + timedelta(days=7)
        rappel2 = rappel1 + timedelta(days=7)
        rappel3 = rappel2 + timedelta(days=7)

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

        # Step 5: Add articles to the facture
        for index, article_data in enumerate(data['articles'], start=1):
            article = Article.objects.get(id=article_data['id'])
            quantity = Decimal(article_data['quantity'])

            prix_htva = Decimal(article.prix_htva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tva_rate = Decimal(0)
            tva_entry = TVA_Categorie_Pays.objects.filter(
                pays=billing_address.code_postal.ville.pays,
                categorie=article.categorie,
            ).first()
            if tva_entry:
                tva_rate = Decimal(tva_entry.tva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            montant_tva_per_item = (prix_htva * tva_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            prix_ttc_per_item = (prix_htva + montant_tva_per_item).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            DetailsFacture.objects.create(
                facture=facture,
                article=article,
                numero_ligne=index,
                quantite=quantity,
                prix_article_htva=prix_htva,
                montant_tva=montant_tva_per_item,
                prix_article_ttc=prix_ttc_per_item,
                tva=tva_rate,
            )

        return Response({
            "message": "Facture created successfully", 
            "facture_id": facture.id,
            "total_htva": str(prix_htva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "total_tva": str(montant_tva_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "total_ttc": str(prix_ttc_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "rappel1": rappel1,
            "rappel2": rappel2,
            "rappel3": rappel3,
        })

    except Client.DoesNotExist:
        return Response({"error": "Client not found."}, status=404)
    except Article.DoesNotExist:
        return Response({"error": "Article not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(['GET'])
def get_factures(request):
    factures = Facture.objects.all()
    serializer = FactureSerializer(factures, many=True)

    print(serializer.data)

    return Response(serializer.data)