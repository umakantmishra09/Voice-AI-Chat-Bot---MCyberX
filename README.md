# MCyberX — Voice AI Chat Bot

A voice-based AI assistant built with Python, Flask, JavaScript, and Groq.

## Features

- 🎙️ Speech-to-text using Groq Whisper
- 🧠 AI responses using Groq-hosted LLM
- 🔊 Text-to-speech using Groq Orpheus
- 💬 Text chat interface
- ⚙️ Basic settings UI
- 🌑 Dark UI

## Tech Stack

- HTML
- CSS
- JavaScript
- Python
- Flask
- Groq API

## Architecture

Microphone / Text
↓
JavaScript
↓
Flask
↓
Groq
↓
Whisper → LLM → Orpheus
↓
Text → Answer → Voice

## Setup

### 1. Install dependencies

```bash
pip install flask groq python-dotenv
