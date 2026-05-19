import argparse
import json
import os
import sys

import google.generativeai as genai

SYSTEM_INSTRUCTION = """
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


def get_api_key() -> str:
    return (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or "AIzaSyDt0tUW0aNZHK6NO_yV4TNd7OozC32SSCA"
    )


def ask_education_ai(prompt: str) -> str:
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("Missing Gemini API key.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        "gemini-2.5-flash", system_instruction=SYSTEM_INSTRUCTION
    )
    response = model.generate_content(prompt)

    text = getattr(response, "text", "")
    if not text:
        raise RuntimeError("Model returned an empty response.")
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("prompt", nargs="*")
    args = parser.parse_args()

    prompt = " ".join(args.prompt).strip()
    if not prompt:
        print(json.dumps({"error": "Prompt is required."}))
        return 1

    try:
        reply = ask_education_ai(prompt)
        print(json.dumps({"response": reply}))
        return 0
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
