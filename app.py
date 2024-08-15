from flask import Flask, render_template, request
import google.generativeai as genai
import os

app = Flask(__name__)

# Set your Google Gemini API key here
os.environ["GOOGLE_API_KEY"] = 'AIzaSyDsRFvJFpnVDq1XTSEgj_BfkdWflUoXzOA'

# Configure Gemini API
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/result', methods=['GET'])
def result():
    # Get form data from the query parameters
    meal_time = request.args.get('mealTime')
    duration = request.args.get('duration')
    food_type = request.args.get('foodType')
    vegetables = request.args.getlist('vegetables')  # Handle multiple vegetables

    # Create a comma-separated list of vegetables
    vegetable_list = ', '.join(vegetables) if vegetables else 'no vegetables'

    # Create the prompt for the Gemini API
    prompt = (f"Find recipes for a {meal_time} meal using the following vegetables: {vegetable_list}. "
              f"The meal should be prepared in {duration} minutes and should be {food_type}.")

    # Create a GenerativeModel instance for the specified model
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    # Call the Gemini API
    response = model.generate_content([prompt])

    # Process the response from the API
    recipe_results = response.text.strip().split('\n')

    # Pass the results to the result.html template
    return render_template('result.html', recipes=recipe_results)

if __name__ == '__main__':
    app.run(debug=True)
