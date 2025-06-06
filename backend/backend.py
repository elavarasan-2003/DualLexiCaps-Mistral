from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import praw
import re
import random
from openai import OpenAI
from fastapi import Path

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://duallexicaps-mistral-frontend.onrender.com"],  # Use your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Limit to only required methods
    allow_headers=["*"],
)


# Reddit API Credentials
reddit = praw.Reddit(
    client_id="431fDSLraVcN7B74pcqV2Q",
    client_secret="XwDypX-vGS714Q35b-659-3yoy5JKQ",
    user_agent="python:com.hatespeechanalyzer:v1.0 (by /u/Few-Topic-4503)",
)

# OpenRouter API Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  # Replace with actual key
)

class TweetInput(BaseModel):
    text: str

@app.post("/analyze/")
def analyze_tweet(tweet: TweetInput):
    prompt = (
        f"Analyze the following tweet and determine if it is 'Hate' or 'Non-Hate'. "
        f"Then, provide a short justification:\n\nTweet: \"{tweet.text}\"\n\n"
        "Respond in the format:\nClassification: [Hate or Non-Hate]\nJustification: [Your explanation]"
    )

    try:
        completion = client.chat.completions.create(
            
            extra_body={},
            model="openai/gpt-3.5-turbo",

            messages=[{"role": "user", "content": prompt}]
        )

        response_text = completion.choices[0].message.content.strip()
        print("DEBUG: API Response ->", response_text)  # Debugging Output

        # Improved regex handling
        match = re.search(r"Classification:\s*(Hate|Non-Hate).*?Justification:\s*(.*)", response_text, re.DOTALL)
        
        if match:
            classification = match.group(1).strip()
            justification = match.group(2).strip()
        else:
            classification = "Unknown"
            justification = "No proper explanation provided by the model."

        return {"classification": classification, "justification": justification}

    except Exception as e:
        return {"error": str(e)}

@app.get("/fetch_reddit/{category}")
def fetch_reddit_post(category: str = Path(..., title="Subreddit Category")):
    try:
        subreddit = reddit.subreddit(category)
        submission = next(subreddit.hot(limit=10))
        return {"post": submission.title}
    except Exception as e:
        return {"error": f"Could not fetch data from subreddit '{category}': {str(e)}"}

