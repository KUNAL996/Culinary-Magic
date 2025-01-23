from datetime import timedelta
import os
from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, session
import google.generativeai as genai
import psycopg2
from psycopg2.extras import DictCursor
import bcrypt
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default-secret-key')

# Set your Google Gemini API key here
os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY', 'Insert API_KEY')
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Configure PostgreSQL connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='DB_Name',
            user='username',
            password='Password'
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None


def is_email_registered(email):
    """Check if an email already exists in the database."""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
                return cursor.fetchone() is not None
        except Exception as e:
            print(f"Error during email check: {e}")
        finally:
            conn.close()
    return False


def flash_message(category, message):
    """Utility to standardize flash messages."""
    flash(message, category)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        # if not name or not email or not password:
        #     flash_message('danger', "All fields are required.")
        #     return render_template('signup.html')

        if is_email_registered(email):
            flash_message('danger', "Email already exists.")
            return render_template('signup.html')

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute(
                        'INSERT INTO users (name, email, password) VALUES (%s, %s, %s)',
                        (name, email, hashed_password)
                    )
                conn.commit()
                flash_message('success', 'You have successfully signed up!')
                return redirect(url_for('login'))
            except Exception as e:
                flash_message('danger', f"Error during signup: {e}")
            finally:
                conn.close()
        else:
            flash_message('danger', "Database connection failed.")
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash_message('danger', "Email and password cannot be empty.")
            return render_template('login.html')

        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            flash_message('danger', "Please enter a valid email address.")
            return render_template('login.html')

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=DictCursor) as cursor:
                    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
                    user = cursor.fetchone()

                if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    session['loggedin'] = True
                    session['id'] = user['id']
                    session['name'] = user['name']

                    session.permanent = True
                    app.permanent_session_lifetime = timedelta(minutes=30)

                    return redirect(url_for('dashboard'))
                else:
                    flash_message('danger', "Invalid email or password.")
            except Exception as e:
                print(f"Database error during login: {e}")
                flash_message('danger', "An error occurred while processing your request. Please try again.")
            finally:
                conn.close()
        else:
            flash_message('danger', "Database connection failed. Please try again later.")

    return render_template('login.html')


@app.route('/')
def dashboard():
    if 'loggedin' in session:
        return render_template('index.html', username=session['name'])
    return redirect(url_for('login'))


# saved_recipes = []

# @app.route('/save_generated_recipe', methods=['POST'])
# def save_generated_recipe():
#     data = request.get_json()
#     if not data:
#         return jsonify({'success': False, 'error': 'No data provided'}), 400

#     recipe = {
#         'id': len(saved_recipes) + 1,
#         'name': data['name'],
#         'ingredients': data['ingredients'],
#         'instructions': data['instructions']
#     }
#     saved_recipes.append(recipe)
#     return jsonify({'success': True, 'recipe': recipe})

# @app.route('/saved_recipes')
# def saved_recipes():
#     if 'loggedin' not in session or not session['loggedin']:
#         return redirect('/login')
#     return render_template('saved_recipes.html', recipes=saved_recipes, username=session.get('name'))

# @app.route('/delete_recipe/<int:recipe_id>', methods=['DELETE'])
# def delete_recipe(recipe_id):
#     global saved_recipes
#     saved_recipes = [recipe for recipe in saved_recipes if recipe['id'] != recipe_id]
#     return jsonify({'success': True})


@app.route('/result', methods=['GET'])
def result():
    if 'loggedin' in session:
        meal_time = request.args.get('mealTime')
        duration = request.args.get('duration')
        food_type = request.args.get('foodType')
        vegetables = request.args.getlist('vegetables')

        vegetable_list = ', '.join(vegetables) if vegetables else 'no vegetables'
        prompt = (  f"Give indian touch to recipe name and indian recipe based on only ingrediants and only instructions(time include) for the following query: "
                    f"Find recipes for a {meal_time} meal using the following vegetables: {vegetable_list}. "
                    f"The meal should be prepared in {duration} minutes and should be {food_type}.")
        try:
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            response = model.generate_content([prompt])
            recipe_results = response.text.strip().split('\n')
        except Exception as e:
            recipe_results = [f"Error generating recipes: {e}"]

        return render_template('result.html', recipes=recipe_results, username=session['name'])
    return redirect(url_for('login'))


@app.route('/logout')
def logout():
    session.clear()
    flash_message('success', 'You have been logged out.')
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True)
