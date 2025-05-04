from django.shortcuts import render

# Create your views here.



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.db import connection

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), '631792757334-5mrcs31gfv0f0uogr4n183ct6gkhljda.apps.googleusercontent.com')
            email = idinfo['email']
            name = idinfo.get('name', '')

            # Query faculty table using raw SQL
            with connection.cursor() as cursor:
                cursor.execute("SELECT fid, name FROM faculty WHERE email = %s", [email])
                row = cursor.fetchone()

                if row:
                    fid, faculty_name = row
                else:
                    # Insert new faculty entry
                    cursor.execute("INSERT INTO faculty (name, email) VALUES (%s, %s)", [name, email])
                    fid = cursor.lastrowid
                    faculty_name = name

            # You can return a token or a mock session object here
            return Response({
                'fid': fid,
                'name': faculty_name,
                'email': email,
                'message': 'Google login successful'
            })

        except ValueError:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
