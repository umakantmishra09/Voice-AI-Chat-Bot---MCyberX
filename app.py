from flask import Flask, request, jsonify, render_template, send_file
from groq import Groq
from dotenv import load_dotenv

import os
import tempfile


# =============================
# LOAD ENVIRONMENT
# =============================

load_dotenv()


# =============================
# CREATE FLASK APP
# =============================

app = Flask(__name__)


# =============================
# GROQ API
# =============================

api_key = os.getenv("GROQ_API_KEY")

print("API KEY FOUND:", api_key is not None)

client = Groq(
    api_key=api_key
)


# =============================
# HOME PAGE
# =============================

@app.route("/")
def home():

    return render_template("index.html")


# =============================
# TEXT CHAT
# =============================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    message = data["message"]

    response = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[

            {
                "role": "system",
                "content": (
                    "You are MCyberX, a personal AI assistant. "
                    "Call the user Boss. "
                    "Keep responses concise and conversational."
                )
            },

            {
                "role": "user",
                "content": message
            }

        ]

    )

    answer = response.choices[0].message.content

    return jsonify({
        "response": answer
    })


# =============================
# VOICE → TEXT
# =============================

@app.route("/voice", methods=["POST"])
def voice():

    audio = request.files["audio"]

    # Create temporary audio file
    with tempfile.NamedTemporaryFile(
        suffix=".webm",
        delete=False
    ) as file:

        audio.save(file.name)

        audio_path = file.name


    try:

        # Open audio properly
        with open(audio_path, "rb") as audio_file:

            transcription = client.audio.transcriptions.create(

                file=audio_file,

                model="whisper-large-v3-turbo",

                language="en"

            )

        text = transcription.text

        return jsonify({
            "text": text
        })


    finally:

        # Delete temporary file after closing it
        if os.path.exists(audio_path):

            os.remove(audio_path)


# =============================
# TEXT → SPEECH
# =============================

@app.route("/speak", methods=["POST"])
def speak():

    data = request.get_json()

    text = data["text"]

    # Orpheus limit
    if len(text) > 200:

        text = text[:197] + "..."


    # Temporary WAV file
    with tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ) as file:

        audio_path = file.name


    try:

        response = client.audio.speech.create(

            model="canopylabs/orpheus-v1-english",

            voice="troy",

            input=text,

            response_format="wav"

        )

        response.write_to_file(audio_path)

        return send_file(
            audio_path,
            mimetype="audio/wav"
        )


    except Exception as error:

        print("TTS ERROR:", error)

        return jsonify({
            "error": str(error)
        }), 500


# =============================
# START SERVER
# =============================

if __name__ == "__main__":

    app.run(debug=True)