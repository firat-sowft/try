from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
import smtplib
from email.mime.text import MIMEText
import random
import string
from flask_cors import CORS
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB bağlantısı
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.WordGame
play_collection = db.play

# E-posta ayarları
sender_email = os.getenv('SENDER_EMAIL')
sender_password = os.getenv('SENDER_PASSWORD')

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(to_email, code):
    msg = MIMEText(f'Doğrulama kodunuz: {code}')
    msg['Subject'] = 'Kelime Oyunu Doğrulama Kodu'
    msg['From'] = sender_email
    msg['To'] = to_email

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)

def json_response(data, status=200):
    response = make_response(jsonify(data), status)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

@app.route('/send-verification', methods=['POST'])
def send_verification():
    data = request.json
    email = data.get('email')
    
    if not email:
        return json_response({'error': 'E-posta adresi gerekli'}, 400)

    verification_code = generate_verification_code()
    
    try:
        send_verification_email(email, verification_code)
        # Doğrulama kodunu geçici olarak sakla
        # Gerçek uygulamada bu kodu güvenli bir şekilde saklamalısınız
        return json_response({'success': True}, 200)
    except Exception as e:
        return json_response({'error': str(e)}, 500)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')
        surname = data.get('surname')
        email = data.get('email')
        password = data.get('password')
        verification_code = data.get('verificationCode')

        if not all([name, surname, email, password, verification_code]):
            print("Missing required fields")
            return json_response({'error': 'Tüm alanlar gerekli'}, 400)

        if play_collection.find_one({'email': email}):
            print("Email already registered")
            return json_response({'error': 'Bu e-posta adresi zaten kayıtlı'}, 400)

        password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$'
        if not re.match(password_regex, password):
            print("Password does not meet criteria")
            return json_response({'error': 'Şifre en az 8, en fazla 16 karakter olmalı, bir büyük harf, bir küçük harf ve bir rakam içermelidir.'}, 400)

        # Log the received data for debugging
        print(f"Received data: {data}")

        # Doğrulama kodunu kontrol et (gerçek uygulamada bu kodu güvenli bir şekilde saklamalısınız)
        # if verification_code_is_invalid(verification_code):
        #     print("Invalid verification code")
        #     return json_response({'error': 'Geçersiz doğrulama kodu'}, 400)

        play_collection.insert_one({
            'name': name,
            'surname': surname,
            'email': email,
            'password': password
        })

        print(f"User {email} registered successfully.")
        return json_response({'success': True}, 200)
    except Exception as e:
        print(f"Error during registration: {e}")
        return json_response({'error': 'Internal Server Error'}, 500)

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    verification_code = data.get('verificationCode')
    new_password = data.get('newPassword')

    if not all([email, verification_code, new_password]):
        return json_response({'error': 'Tüm alanlar gerekli'}, 400)

    # Doğrulama kodunu kontrol et (gerçek uygulamada bu kodu güvenli bir şekilde saklamalısınız)
    # if verification_code_is_invalid(verification_code):
    #     return json_response({'error': 'Geçersiz doğrulama kodu'}, 400)

    result = play_collection.update_one(
        {'email': email},
        {'$set': {'password': new_password}}
    )

    if result.matched_count == 0:
        return json_response({'error': 'Kullanıcı bulunamadı'}, 404)

    return json_response({'success': True}, 200)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return json_response({'error': 'E-posta ve şifre gerekli'}, 400)

    user = play_collection.find_one({'email': email, 'password': password})
    if user:
        return json_response({'user': {'name': user['name'], 'surname': user['surname']}}, 200)
    else:
        return json_response({'error': 'Geçersiz e-posta veya şifre'}, 401)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)