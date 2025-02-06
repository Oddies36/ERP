from rest_framework import serializers
from django.contrib.auth.models import User

#Serializer qui va faire en sorte de mettre en forme les données pour la DB. Utilisé pour le login
class LoginSerializer(serializers.Serializer):
  username = serializers.CharField(required=True,
                                   allow_blank=False,
                                   allow_null=False,
                                   error_messages={
                                     "required": "Entrez votre nom d'utilisateur.",
                                     "blank": "Entrez votre nom d'utilisateur.",
                                     "null": "Entrez votre nom d'utilisateur."
  })
  password = serializers.CharField(required=True,
                                   allow_blank=False,
                                   allow_null=False,
                                   error_messages={
                                     "required": "Entrez votre mot de passe.",
                                     "blank": "Entrez votre mot de passe.",
                                     "null": "Entrez votre mot de passe."
  })

#Serializer qui va faire en sorte de mettre en forme les données pour la DB. Utilisé pour la création d'un nouveau user
class UserSerializer(serializers.ModelSerializer):
  #Pour sécurité, on précise que le mot de passe est uniquement pour l'écriture et jamais comme lecture pour ne pas dévoiler les mdp hashé ou claire.
  password = serializers.CharField(write_only=True,
                                   required=True,
                                   allow_blank=False,
                                   allow_null=False,
                                   error_messages={
                                     "required": "Le mot de passe est obligatoire.",
                                     "blank": "Le mot de passe ne peut pas être vide.",
                                     "null": "Le mot de passe ne peut pas être vide."
                                   }
                                   )
  username = serializers.CharField(required=True,
                                   allow_blank=False,
                                   allow_null=False,
                                   error_messages={
                                     "required": "Le nom d'utilisateur est obligatoire.",
                                     "blank": "Le nom d'utilisateur ne peut pas être vide.",
                                     "null": "Le nom d'utilisateur ne peut pas être vide."
                                   }
                                   )
  first_name = serializers.CharField(required=True,
                                     allow_blank=False,
                                     allow_null=False,
                                     error_messages={
                                     "required": "Le prénom est obligatoire.",
                                     "blank": "Le prénom ne peut pas être vide.",
                                     "null": "Le prénom ne peut pas être vide."
                                   }
                                     )
  last_name = serializers.CharField(required=True,
                                    allow_blank=False,
                                    allow_null=False,
                                    error_messages={
                                     "required": "Le nom est obligatoire.",
                                     "blank": "Le nom ne peut pas être vide.",
                                     "null": "Le nom ne peut pas être vide."
                                   }
                                    )
  email = serializers.EmailField(required=True,
                                 error_messages={
                                   "required": "L'adresse mail est obligatoire.",
                                   "blank": "L'adresse mail ne peut pas être vide.",
                                   "null": "L'adresse mail ne peut pas être vide."
                                 }
                                 )


  #La class Meta fait partie du framework Rest de Django.
  class Meta:
    #Précise quel model on vise. Dans ce cas c'est User
    #Facilite l'écriture. Si on ne le fait pas, il faut préciser la longueur etc qu'on précise déjà dans Model
    model = User
    #Précise les fields dans User qu'on veut serialiser/déserialiser
    fields = ['username', 'email', 'password', 'first_name', 'last_name']

  #Vérifie si le username existe déjà
  def validate_username(self, value):
    if User.objects.filter(username=value).exists():
      raise serializers.ValidationError("Le nom d'utilisateur existe déjà.")
    return value

  #Assure que le mot de passe suit bien les règles
  def validate_password(self, value):
    if len(value) < 8:
      raise serializers.ValidationError("Mot de passe doit contenir au moin 8 caractères.")
    if not any(char.isdigit() for char in value):
      raise serializers.ValidationError("Mot de passe doit contenir au moin 1 chiffre")
    if not any(char.isupper() for char in value):
      raise serializers.ValidationError("Mot de passe doit contenir au moir une majuscule")
    if not any(char.islower() for char in value):
      raise serializers.ValidationError("Mot de passe doit contenir au moin une minuscule")
    return value

  #Quand on fait .save() dans la view, le create() ici est executé
  def create(self, validated_data):
    user = User.objects.create_user(
      first_name = validated_data['first_name'],
      last_name = validated_data['last_name'],
      username = validated_data['username'],
      email = validated_data['email'],
      password = validated_data['password']
    )

    return user