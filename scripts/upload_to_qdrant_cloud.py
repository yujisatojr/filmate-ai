import pandas as pd
import ast
import os
from openai import OpenAI
import openai
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
file_path = '../datasets/latest_with_embeddings.csv'
df = pd.read_csv(file_path) # Add .head(100) if you want to limit the number of rows

df = df.fillna('')

print(str(len(df)) + ' rows')

# qdrant_client = QdrantClient(':memory:') # Uncomment this for testing locally

# Connect to the cloud version of the Qdrant client
qdrant_client = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY'),
)

print(qdrant_client.get_collections())

# Set the collection name and size
collection_name = 'movies'
vector_size = len(ast.literal_eval(df['metadata_vector'][0]))  # Convert string to list and get its length

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

# Calculate the length of payload that is being inserted into the Qdrant collection
def calculate_payload_length(payload):
    total_length = 0
    for value in payload.values():
        if isinstance(value, str):
            total_length += len(value)
        elif isinstance(value, list):
            for item in value:
                total_length += len(str(item))
        elif isinstance(value, dict):
            total_length += calculate_payload_length(value)
        else:
            total_length += len(str(value))
    return total_length

# Add vectors to the collection
request_length = 0

for k, v in df.iterrows():
    # Remove the 'metadata_vector' key from the dictionary to reduce the payload length
    result_dict = v.to_dict()
    if 'metadata_vector' in result_dict:
        del result_dict['metadata_vector']

    payload_length = calculate_payload_length(result_dict)
    vector_length = len(ast.literal_eval(v['metadata_vector']))
    total_length = payload_length + vector_length
    # print(f"Payload length for point {k}: {total_length}")

    request_length = request_length + total_length
    
    qdrant_client.upsert(
        collection_name=collection_name,
        points=[
            rest.PointStruct(
                id=k,
                vector={
                    'metadata': ast.literal_eval(v['metadata_vector']),  # Convert string to list
                },
                payload=result_dict,
            )
        ]
    )

print(f"Payload & vector length for all points: {request_length}")
print(qdrant_client.get_collections())
qdrant_client.count(collection_name=collection_name)