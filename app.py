import pandas as pd
import os
# import logging
from openai import OpenAI
import openai
from tqdm import tqdm
from dotenv import load_dotenv, find_dotenv
from qdrant_client import models, QdrantClient
from qdrant_client.http import models as rest
from qdrant_client.http.models import Record
from sentence_transformers import SentenceTransformer

load_dotenv(find_dotenv())
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
)

# Read the CSV dataset
file_path = './datasets/movies_embedding.csv'
df = pd.read_csv(file_path) # Add .head(100) if you want to limit the number of rows

print(str(len(df)) + ' rows')
print(df.head(5))

# Initialize the Qdrant client
qdrant_client = QdrantClient(':memory:')

# Set the collection name and size
collection_name = 'movies'
vector_size = len(df['metadata_vector'][0])

# Create a collection
qdrant_client.recreate_collection(
    collection_name=collection_name,
    vectors_config={
        'metadata': rest.VectorParams(
            distance=rest.Distance.COSINE,
            size=vector_size,
        ),
    }
)

# Add vectors to the collection
qdrant_client.upsert(
    collection_name=collection_name,
    points=[
        rest.PointStruct(
            id=k,
            vector={
                'metadata': v['metadata_vector'],
            },
            payload=v.to_dict(),
        )
        for k, v in df.iterrows()
    ],
)

print(qdrant_client.get_collections())
qdrant_client.count(collection_name=collection_name)

# Generate a query embedding and search in Qdrant
def query_qdrant(query, collection_name, vector_name, top_k=20):
    # Creates embedding vector from user query
    completion = openai.embeddings.create(
        input=query,
        model='text-embedding-3-small'  # Be sure to use the same embedding model as the vectors in the collection
    )

    embedded_query = completion.data[0].embedding

    query_results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=(
            vector_name, embedded_query
        ),
        limit=top_k,
    )
    
    return query_results

# Filter by conditions in Qdrant
def filter_qdrant(adult, collection_name, vector_name, top_k=5):
    query_results = qdrant_client.scroll(
        collection_name=collection_name,
        scroll_filter=models.Filter(
            must=[
                # models.FieldCondition(
                #     key="year",
                #     match=models.MatchValue(value=year),
                # ),
                models.FieldCondition(
                    key="adult",
                    match=models.MatchValue(value=adult),
                ),
            ]
        ),
    )
    return query_results

# query_results = filter_qdrant(adult=False, collection_name=collection_name, vector_name='metadata')

# print(query_results)

# for i, vector in enumerate(query_results):
#     # print(vector[0])
#     print(vector[i].payload['title'])

# Format the response as JSON
import json
from datetime import datetime
import locale

# Assume year in 2000's if between 00 to 24, otherwise, in 1900's
def convert_date_format(date_str):
    month, day, year = map(int, date_str.split('/'))
    
    if year >= 0 and year <= 24:
        year += 2000
    else:
        year += 1900

    date_obj = datetime(year, month, day)
    formatted_date = date_obj.strftime('%m/%d/%Y')
    
    return formatted_date

def string_to_array(str):
    arr = str.split(',')
    arr = [arr.strip() for arr in arr]

    return arr

def format_time(minutes_float):
    minutes_int = int(minutes_float)

    hours = minutes_int // 60
    minutes = minutes_int % 60
    
    if hours > 0:
        time_string = f"{hours}h {minutes}m"
    else:
        time_string = f"{minutes}m"
    
    return time_string

def format_as_dollars(number):
    locale.setlocale(locale.LC_ALL, '')

    number = int(number)
    formatted_number = locale.currency(number, grouping=True)
    formatted_number = formatted_number.replace(locale.localeconv()['currency_symbol'], "$")

    return formatted_number

def get_country_name(abbreviation):
    country_names = {'en': 'English', 'fr': 'French', 'zh': 'Chinese', 'it': 'Italian', 'fa': 'Persian', 'nl': 'Dutch', 'de': 'German', 'cn': 'Chinese', 'ar': 'Arabic', 'es': 'Spanish', 'ru': 'Russian', 'sv': 'Swedish', 'ja': 'Japanese', 'ko': 'Korean', 'sr': 'Serbian', 'bn': 'Bengali', 'he': 'Hebrew', 'pt': 'Portuguese', 'wo': 'Wolof', 'ro': 'Romanian', 'hu': 'Hungarian', 'cy': 'Welsh', 'vi': 'Vietnamese'}
    return country_names.get(abbreviation, '')

# Function to search for similar vectors
def search_movies_in_qdrant(query):
    query_results = query_qdrant(query, collection_name, 'metadata')

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "date": convert_date_format(vector.payload["date"]),
            "genres": string_to_array(vector.payload["genres"]),
            "runtime": format_time(vector.payload["runtime"]),
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "budget": format_as_dollars(vector.payload["budget"]),
            "revenue": format_as_dollars(vector.payload["revenue"]),
            "language": get_country_name(vector.payload["language"]),
            "adult": vector.payload["adult"],
            "production": string_to_array(vector.payload["production"]),
            "poster_link": vector.payload["poster_link"]
        }
        results.append(tmp)

    return results

query = 'scary movies about monsters after year 2003'
response = (search_movies_in_qdrant(query))

json_string = json.dumps(response, indent=2)
print(json_string)