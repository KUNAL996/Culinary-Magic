import google.generativeai as genai
import os

os.environ["GOOGLE_API_KEY"] = 'AIzaSyDsRFvJFpnVDq1XTSEgj_BfkdWflUoXzOA'
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel(model_name="gemini-1.5-flash")
prompt = (f"Find recipes for a dinner meal using the following vegetables: carrots, onions. "
          f"The meal should be prepared in 30 minutes and should be vegan.")
response = model.generate_content([prompt])

print(response.text)
