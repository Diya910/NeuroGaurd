import tweepy
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from datetime import datetime

nltk.download('stopwords')

# Define a list of crisis-related keywords
keywords = [
    "depressed", "depression", "addiction help", "overwhelmed", "suicidal",
    "substance abuse", "mental health", "anxiety", "hopeless", "lonely",
    "self-harm", "trauma", "stress", "anxious", "insomnia"
]

def clean_text(text):
    """
    Cleans the provided text by:
    - Removing emojis via regex.
    - Removing special characters and numbers (keeping only letters and spaces).
    - Converting text to lowercase.
    - Removing English stopwords.
    """
    # Remove emojis using a regex pattern
    emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               u"\U0001F680-\U0001F6FF"  # transport & map symbols
                               u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                               "]+", flags=re.UNICODE)
    text = emoji_pattern.sub(r'', text)
    
    # Remove special characters and numbers, keep only letters and spaces
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    text = text.lower()

    stop_words = set(stopwords.words('english'))
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    
    return ' '.join(tokens)

def extract_tweets(keywords, max_results=100):
    """
    Uses the Twitter API to search for recent tweets containing the keywords.
    Extracts the tweet ID, timestamp, text (cleaned), and engagement metrics.
    """
    # Build the query string with OR logic; exclude retweets
    query = " OR ".join([f'"{kw}"' for kw in keywords]) + " -is:retweet"
    
    # Initialize the Tweepy client with your bearer token (replace with your token)
    client = tweepy.Client(bearer_token="your_bearer_token_here")

    tweets = client.search_recent_tweets(
        query=query,
        tweet_fields=["id", "created_at", "text", "public_metrics"],
        max_results=max_results
    )
    
    tweet_data = []
    
    if tweets.data:
        for tweet in tweets.data:
            cleaned_text = clean_text(tweet.text)
            metrics = tweet.public_metrics
            tweet_entry = {
                "post_id": tweet.id,
                "timestamp": tweet.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "content": cleaned_text,
                "likes": metrics.get("like_count", 0),
                "comments": metrics.get("reply_count", 0),
                "shares": metrics.get("retweet_count", 0)
            }
            tweet_data.append(tweet_entry)
    
    return tweet_data

def main():
    tweets = extract_tweets(keywords, max_results=100)
    df = pd.DataFrame(tweets)
    
    # Save the DataFrame to CSV and JSON formats
    df.to_csv("twitter_posts.csv", index=False)
    df.to_json("twitter_posts.json", orient="records", lines=True)
    
    print("Data extraction and cleaning complete. Files saved: twitter_posts.csv, twitter_posts.json")

if __name__ == "__main__":
    main()