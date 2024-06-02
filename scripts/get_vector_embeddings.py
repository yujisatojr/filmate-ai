import pandas as pd
import os
import logging
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI
import openai
from tqdm import tqdm

load_dotenv(find_dotenv())

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
)

# Read the CSV dataset
file_path = '../datasets/latest_with_metadata.csv'
df = pd.read_csv(file_path)

df = df.fillna('')

print(len(df))

tqdm.pandas()

# Create a new column named 'metadata' with all the data combined
def generate_metadata(row):
    cast = ', '.join(filter(None, [str(row['cast_1']), str(row['cast_2']), str(row['cast_3'])]))
    return f"{row['title']} | {row['director_1']} | {cast} | {row['summary']}"

# Create new column 'metadata'
df['metadata'] = df.progress_apply(generate_metadata, axis=1)

# Generate the vector embeddings for selected columns
def get_embedding(text, model='text-embedding-3-small'):
    try:
        # text = text.replace('\n', ' ')
        return client.embeddings.create(input = [text], model=model).data[0].embedding
    except Exception as e:
        logging.error(f'Error generating embeddings: {e}. Found issue in the following text: {text}.')
        text = 'No data available'
        return client.embeddings.create(input = [text], model=model).data[0].embedding

df['metadata_vector'] = df['metadata'].progress_apply(lambda x: get_embedding(x, model='text-embedding-3-small'))
print('Conversion to vector embeddings has been completed.')

df.to_csv('latest_with_embeddings.csv', index=False)