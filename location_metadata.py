import pandas as pd
import folium
from folium.plugins import HeatMap
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import spacy
import time

nlp = spacy.load("en_core_web_sm")

def extract_location(text):
    """
    Uses spaCy NER to extract location mentions from text.
    Returns the first detected entity labeled as GPE or LOC.
    """
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ in ("GPE", "LOC"):
            return ent.text
    return None

def geocode_location(location, geolocator, geocode):
    """
    Geocodes a location string into (latitude, longitude) using Nominatim.
    Returns (None, None) if no location is found.
    """
    try:
        loc = geocode(location)
        if loc:
            return loc.latitude, loc.longitude
    except Exception as e:
        print(f"Geocoding error for '{location}': {e}")
    return None, None

def main():
    df = pd.read_csv("twitter_posts_classified.csv")

    df['detected_location'] = df['content'].apply(extract_location)
    df['latitude'] = None
    df['longitude'] = None

    geolocator = Nominatim(user_agent="crisis_mapper")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

    # Iterate over the DataFrame and geocode detected locations
    for i, row in df.iterrows():
        loc_name = row['detected_location']
        if pd.notnull(loc_name):
            lat, lon = geocode_location(loc_name, geolocator, geocode)
            df.at[i, 'latitude'] = lat
            df.at[i, 'longitude'] = lon
            time.sleep(0.5)

    # Filter out rows with valid geocoded coordinates
    df_valid = df.dropna(subset=['latitude', 'longitude'])
    
    if df_valid.empty:
        print("No valid geocoded locations found in the dataset.")
        return

    # Create a Folium map centered on the average coordinates
    center_lat = df_valid['latitude'].astype(float).mean()
    center_lon = df_valid['longitude'].astype(float).mean()
    m = folium.Map(location=[center_lat, center_lon], zoom_start=4)
    
    # Prepare data for the heatmap: a list of [lat, lon] pairs
    heat_data = df_valid.apply(lambda row: [float(row['latitude']), float(row['longitude'])], axis=1).tolist()
    HeatMap(heat_data, radius=8).add_to(m)
    
    # Save the heatmap to an HTML file
    m.save("crisis_heatmap.html")
    print("Heatmap generated and saved to 'crisis_heatmap.html'.")

    # Compute top 4 detected locations by frequency
    top_locations = df_valid['detected_location'].value_counts().head(4)
    print("\nTop 4 locations with the highest crisis discussions:")
    print(top_locations)
    
    # Save the updated DataFrame with geocoding information for further analysis
    df.to_csv("twitter_posts_geocoded.csv", index=False)
    print("\nUpdated dataset saved as 'twitter_posts_geocoded.csv'.")

if __name__ == "__main__":
    main()