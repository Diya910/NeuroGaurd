import pandas as pd
import matplotlib.pyplot as plt
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

nltk.download('vader_lexicon')

# Initialize VADER sentiment analyzer
sia = SentimentIntensityAnalyzer()

def classify_sentiment(text):
    """
    Classifies sentiment into Positive, Neutral, or Negative using VADER.
    """
    sentiment_score = sia.polarity_scores(text)['compound']
    if sentiment_score >= 0.05:
        return "Positive"
    elif sentiment_score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

def classify_risk(text):
    """
    Classifies crisis risk level based on the presence of specific phrases.
    High-Risk: Direct crisis language (e.g., "I don't want to be here", "kill myself")
    Moderate Concern: Indications of struggle (e.g., "feel lost", "need help")
    Low Concern: General discussion about mental health
    """
    text_lower = text.lower()

    high_risk_keywords = [
        "don't want to be here", "end it all", "kill myself", "suicide", 
        "i want to die", "cant go on", "can not go on"
    ]
    moderate_risk_keywords = [
        "feel lost", "need help", "struggling", "hard to cope", 
        "feeling overwhelmed", "depressed", "anxious", "lonely", 
        "feeling down", "feeling sad"
    ]
    
    for phrase in high_risk_keywords:
        if phrase in text_lower:
            return "High-Risk"
    
    for phrase in moderate_risk_keywords:
        if phrase in text_lower:
            return "Moderate Concern"
    
    return "Low Concern"

def main():
    df = pd.read_csv("twitter_posts.csv")

    df['sentiment'] = df['content'].apply(classify_sentiment)
    df['risk_level'] = df['content'].apply(classify_risk)

    print("Sample classified data:")
    print(df.head())

    distribution = pd.crosstab(df['sentiment'], df['risk_level'])
    print("\nDistribution Table (Sentiment vs. Risk Level):")
    print(distribution)
    
    # Plot the distribution as a stacked bar chart
    ax = distribution.plot(kind='bar', stacked=True, figsize=(10,6))
    plt.title("Distribution of Tweets by Sentiment and Risk Level")
    plt.xlabel("Sentiment")
    plt.ylabel("Count")
    plt.legend(title="Risk Level")
    plt.tight_layout()
    plt.savefig("sentiment_risk_distribution.png")
    plt.show()
    
    # Save the updated DataFrame to new CSV and JSON files for further analysis
    df.to_csv("twitter_posts_classified.csv", index=False)
    df.to_json("twitter_posts_classified.json", orient="records", lines=True)
    print("\nClassification complete. Files saved: twitter_posts_classified.csv, twitter_posts_classified.json, sentiment_risk_distribution.png")

if __name__ == "__main__":
    main()