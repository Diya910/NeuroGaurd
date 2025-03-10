
# NeuroGuard: Mental Health Crisis Detection System

![NeuroGuard Logo](https://img.shields.io/badge/NeuroGuard-Mental%20Health%20Crisis%20Detection-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-brightgreen)

## Overview

NeuroGuard is a comprehensive system designed to detect, analyze, and visualize potential mental health crises through social media data. By leveraging natural language processing and geospatial analysis, NeuroGuard identifies concerning patterns in public discussions about mental health, enabling timely intervention and resource allocation.

## Features

- **Social Media Data Collection**: Extract tweets containing mental health-related keywords
- **Text Cleaning & Preprocessing**: Remove noise and prepare text for analysis
- **Sentiment Analysis**: Classify content as positive, neutral, or negative
- **Risk Level Assessment**: Categorize posts into high-risk, moderate concern, or low concern
- **Location Extraction**: Identify geographical references in posts
- **Geospatial Visualization**: Generate heatmaps of crisis mentions by location

## Project Structure
```
NeuroGuard/
├── data_extraction.py      # Twitter data collection and preprocessing
├── risk_classification.py  # Sentiment analysis and risk level assessment
├── location_metadata.py    # Location extraction and geospatial visualization
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation
```
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Diya910/NeuroGuard.git
   cd NeuroGuard
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download required NLTK and spaCy models:
   ```bash
   python -m nltk.downloader stopwords vader_lexicon
   python -m spacy download en_core_web_sm
   ```

## Usage

### 1. Data Extraction

The `data_extraction.py` script collects tweets containing mental health-related keywords, cleans the text, and saves the data.

```bash
python data_extraction.py
```

**Important**: Before running, replace `"your_bearer_token_here"` with your actual Twitter/X API bearer token. You can obtain this token by:
1. Creating a developer account at [Twitter Developer Portal](https://developer.twitter.com/)
2. Creating a project and app
3. Generating a bearer token from your app settings

**Outputs**:
- `twitter_posts.csv`: CSV file containing collected tweets
- `twitter_posts.json`: JSON file containing the same data

### 2. Risk Classification

The `risk_classification.py` script analyzes the collected tweets to determine sentiment and risk levels.

```bash
python risk_classification.py
```

**Outputs**:
- `twitter_posts_classified.csv`: Original data with sentiment and risk level classifications
- `twitter_posts_classified.json`: JSON version of the classified data
- `sentiment_risk_distribution.png`: Visualization of sentiment vs. risk level distribution

### 3. Location Analysis

The `location_metadata.py` script extracts location mentions from tweets and generates geospatial visualizations.

```bash
python location_metadata.py
```

**Outputs**:
- `twitter_posts_geocoded.csv`: Data with extracted location information and coordinates
- `crisis_heatmap.html`: Interactive heatmap showing the geographical distribution of crisis mentions
- Console output (`location_metadata_output.png`) showing the top 4 locations with highest crisis discussions

## Understanding the Outputs

### Risk Classification

The risk classification system categorizes posts into three levels:

- **High-Risk**: Posts containing direct expressions of suicidal ideation or severe crisis
- **Moderate Concern**: Posts indicating struggles with mental health that need attention
- **Low Concern**: General discussions about mental health topics

### Sentiment Analysis

Each post is classified as:

- **Positive**: Content with an overall positive tone
- **Neutral**: Content without strong emotional indicators
- **Negative**: Content with an overall negative tone

### Geospatial Analysis

The heatmap visualization shows:

- **Hotspots**: Areas with high concentrations of mental health crisis mentions
- **Distribution**: Geographical spread of discussions across regions
- **Patterns**: Potential regional trends in mental health discussions

## Requirements

The project requires the following dependencies (detailed in `requirements.txt`):
- tweepy
- pandas
- nltk
- matplotlib
- spacy
- geopy
- folium

## Disclaimer

NeuroGuard is designed for research and public health monitoring purposes only. It should not be used as a substitute for professional mental health assessment or intervention. If you or someone you know is experiencing a mental health crisis, please contact a mental health professional or crisis hotline immediately.
