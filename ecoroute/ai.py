import google.generativeai as genai


genai.configure(api_key="AIzaSyD7055nbncorFBhhZyMLO0NLEo6NZNUyC4")

system_instruction = """
You are a helpful assistant for a travel website.
You ONLY answer questions about:
- flights
- routes
- airports
- train/flight comparisons
- emissions
- climate awareness
- sustainable travel

If the user asks about anything else, politely say:
"I'm only able to answer questions about flights and climate-aware travel."
"""


model = genai.GenerativeModel("gemini-2.5-flash",system_instruction = system_instruction)


response = model.generate_content(
    "Explain transformers in simple terms."
    
)

