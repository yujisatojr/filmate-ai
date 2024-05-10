from datetime import datetime
from dotenv import load_dotenv, find_dotenv
import json
import locale
from openai import OpenAI
import openai
import os
from qdrant_client import models, QdrantClient
from qdrant_client.http import models as rest
from qdrant_client.http.models import Record
from groq import Groq

load_dotenv(find_dotenv())

client = Groq(
    api_key=os.getenv('GROQ_API_KEY'),
)

# client = OpenAI(
#     api_key=os.getenv('OPENAI_API_KEY'),
# )

# Connect to the Qdrant cloud
qdrant_client = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY'),
)

collection_name = 'movies'
vector_name='metadata'
llm_model_name="mixtral-8x7b-32768"
# llm_model_name="gpt-3.5-turbo-0125"
embedding_model_name = 'text-embedding-3-small' # Be sure to use the same embedding model as the vectors in the collection

print(qdrant_client.get_collections())
qdrant_client.count(collection_name=collection_name)

# Convert string query to vector embeddings
def get_query_embeddings(query):
    completion = openai.embeddings.create(
        input=query,
        model=embedding_model_name
    )

    return completion.data[0].embedding

# Search with query embeddings in Qdrant
def search_qdrant(query, collection_name, vector_name, top_k):

    embedded_query = get_query_embeddings(query)

    query_results = qdrant_client.search(
        collection_name=collection_name,
        search_params=models.SearchParams(hnsw_ef=128, exact=False),
        query_vector=(
            vector_name, embedded_query
        ),
        limit=top_k,
    )
    
    return query_results

def get_default_list():
    embedded_query = get_query_embeddings('')

    filter_conditions = []
    filter_conditions.append(models.FieldCondition(
        key="year",
        range=models.Range(
            gte=2024,
        )
    ))
    filter_conditions.append(models.FieldCondition(
        key="votes",
        range=models.Range(
            gte=20000,
        )
    ))

    query_results = qdrant_client.search(
        collection_name=collection_name,
        query_filter=models.Filter(
            must=filter_conditions,
        ),
        search_params=models.SearchParams(hnsw_ef=128, exact=False),
        query_vector=(
            vector_name, embedded_query
        ),
        limit=12,
    )
    
    results = []
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "id": vector.payload["id"],
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "year": vector.payload["year"],
            "certificate": vector.payload["certificate"],
            "genre": vector.payload["genre"],
            "runtime": vector.payload["runtime"],
            "runtime_mins": vector.payload["runtime_mins"],
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "sentiment": vector.payload["sentiment_normalized"],
            "metadata": vector.payload["metadata"],
            "img": vector.payload["img"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

# Create filter for Qdrant search
def create_filter(json_query):

    # Extract values from json object
    data = json.loads(json_query)

    # user_query = data['searchInput']
    certificate = data['selectedCertificate']
    genre = data['selectedGenre']
    popularity = data['selectedPopularity']
    rating = data['selectedRating']
    runtime = data['selectedRuntime']
    sentiment = data['selectedSentiment']
    year = data['selectedYear']

    filter_conditions = []

    # Create filter for certificate selection
    certificateArray = []
    for key, value in certificate.items():
        if key == "PG13" and value:
            key = "PG-13"
        elif key == "PG14" and value:
            key = "PG-14"
        elif key == "TV14" and value:
            key = "TV-14"
        elif key == "TVMA" and value:
            key = "TV-MA"
        elif key == "NotRated" and value:
            key = "Not Rated"
            
        if value:
            certificateArray.append(key)

    if not certificateArray:
        certificateArray = []
    
    if certificateArray != []:
        filter_conditions.append(models.FieldCondition(
            key="certificate",
            match=models.MatchAny(any=certificateArray),
        ))

    # Create filter for genre selection
    genreArray = []
    for key, value in genre.items():
        if key == "SciFi" and value:
            key = "Sci-Fi"
        
        if value:
            genreArray.append(key)

    if not genreArray:
        genreArray = []
    
    if genreArray != []:
        filter_conditions.append(models.FieldCondition(
            key="genre",
            match=models.MatchAny(any=genreArray),
        ))
    
    popularity_mapping = {2: 200000, 3: 500000, 4: 1000000, 5: 2000000}

    for i in range(len(popularity)):
        popularity[i] = popularity_mapping.get(popularity[i], popularity[i])
    
    filter_conditions.append(models.FieldCondition(
        key="votes",
        range=models.Range(
            gte=popularity[0],
            lte=popularity[1]
        )
    ))

    filter_conditions.append(models.FieldCondition(
        key="rating",
        range=models.Range(
            gte=rating[0],
            lte=rating[1]
        )
    ))

    filter_conditions.append(models.FieldCondition(
        key="runtime_mins",
        range=models.Range(
            gte=runtime[0],
            lte=runtime[1]
        )
    ))

    filter_conditions.append(models.FieldCondition(
        key="sentiment_normalized",
        range=models.Range(
            gte=sentiment[0],
            lte=sentiment[1]
        )
    ))

    filter_conditions.append(models.FieldCondition(
        key="year",
        range=models.Range(
            gte=year[0],
            lte=year[1]
        )
    ))

    print('===============Filter Applied===============')
    print(filter_conditions)
    print('============================================')
    
    return filter_conditions

def filter_and_search(json_query, collection_name, vector_name, top_k):

    filter_conditions = create_filter(json_query)

    json_parsed = json.loads(json_query)
    user_query = json_parsed['searchInput']

    embedded_query = get_query_embeddings(user_query)

    query_results = qdrant_client.search(
        collection_name=collection_name,
        query_filter=models.Filter(
            must=filter_conditions,
        ),
        search_params=models.SearchParams(hnsw_ef=128, exact=False),
        query_vector=(
            vector_name, embedded_query
        ),
        limit=top_k,
    )
    
    return query_results

# Search qdrant based on user query and filter selections
def search_movies_in_qdrant(json_body):

    json_query = json.dumps(json_body)

    query_results = filter_and_search(json_query, collection_name, vector_name, top_k=12)

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "id": vector.payload["id"],
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "year": vector.payload["year"],
            "certificate": vector.payload["certificate"],
            "genre": vector.payload["genre"],
            "runtime": vector.payload["runtime"],
            "runtime_mins": vector.payload["runtime_mins"],
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "sentiment": vector.payload["sentiment_normalized"],
            "metadata": vector.payload["metadata"],
            "img": vector.payload["img"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

# Search for similar movies using metadata
def search_similar_in_qdrant(metadata):

    query_results = search_qdrant(metadata, collection_name, vector_name, top_k=5)

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "id": vector.payload["id"],
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "year": vector.payload["year"],
            "certificate": vector.payload["certificate"],
            "genre": vector.payload["genre"],
            "runtime": vector.payload["runtime"],
            "runtime_mins": vector.payload["runtime_mins"],
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "sentiment": vector.payload["sentiment_normalized"],
            "metadata": vector.payload["metadata"],
            "img": vector.payload["img"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

def get_recommendations(user_query):

    prompt_template = f"""
        Your task is to parse the following query '{user_query}' provided by a user and generate JSON output according to the template provided later.
        The explanation of each value in the JSON template is as follows:
        "insights": For this field, provide a brief, ~70 word sentence(s) on which movies, directors, and/or actors/actresses the user might like based on the user's query.  Use 'you' to refer to the user. The entire sentence needs to have a friendly tone and avoid fluff. Do not use words like 'delve' or 'dive into'. If the user query is empty, please leave this field empty.
        Below is the JSON template:
        {{
            "insights": "If you're into sea-themed adventures, you might enjoy movies like "Pirates of the Caribbean" or "The Life Aquatic with Steve Zissou" for a quirky deep-sea exploration. Directors like James Cameron, known for "Titanic" and "The Abyss," or Steven Spielberg's "Jaws" could also float your boat."
        }}
    """

    messages = [{
            "role": "system",
            "content": "Please generate output in JSON format exclusively, avoiding any additional text or explanations.",
        },
        {
            "role": "user",
            "content": prompt_template
        }
    ]

    stream = client.chat.completions.create(
        model=llm_model_name,
        messages=messages,
        max_tokens=500,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

# Get related news based on the given movie title
def get_movie_facts(movie_title):

    prompt_template = f"""
        Your task is to provide 3 insightful facts or trivias about this movie: {movie_title} by strictly following the below example JSON format. The JSON output needs to be correctly formatted and is valid. Avoid the use of single quotes, special characters, and newlines. Within the JSON template, headline represents the brief, one sentence summarization of the news articles. Make each sentence around 25 words long.
        {{
            "headline_1": "Directorial Vision: Paris, Texas (1984) is directed by the acclaimed German filmmaker Wim Wenders. Known for his poetic and atmospheric storytelling, Wenders brings a unique perspective to the American landscape in this film.",
            "headline_2": "Collaborative Screenplay: The screenplay for Paris, Texas (1984) is credited to Pulitzer Prize-winning playwright Sam Shepard. Shepard's talent for crafting authentic dialogue and exploring complex human relationships shines through in the film.",
            "headline_3": "Iconic Cinematography: One of the most striking aspects of Paris, Texas (1984) is its stunning cinematography, captured by legendary cinematographer Robby Müller. Müller's use of wide shots and evocative lighting enhances the film's themes of isolation and longing, while also showcasing the beauty of the American Southwest.",
        }}
    """

    messages = [{
            "role": "system",
            "content": "Please generate output in the correct and valid JSON format exclusively, avoiding any additional text or explanations.",
        },
        {
            "role": "user",
            "content": prompt_template
        }
    ]

    stream = client.chat.completions.create(
        model=llm_model_name,
        messages=messages,
        max_tokens=250,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

# Get a official trailer link based on the given movie title
def get_movie_trailer(movie_title):

    messages = [{
            "role": "system",
            "content": "Please generate output in JSON format exclusively, avoiding any additional text or explanations.",
        },
        {
            "role": "user",
            "content": f"""Provide me an URL link to the official trailer of the following movie from YouTube: '{movie_title}'. If the video does not exist on YouTube, return an empty string. The following is the expected JSON format: {{ "url": "https://youtu.be/YoHD9XEInc0?si=fr6_zmKA6gpoXVpL" }}"""
        }
    ]

    stream = client.chat.completions.create(
        model=llm_model_name,
        messages=messages,
        max_tokens=100,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

# Get top cast member names based on the given movie title
def get_movie_casts(movie_title):

    prompt_template = f"""
        Your task is to provide up to 5 main cast names of this movie: '{movie_title}' in the following JSON format. If the name is unknown, please leave the each field empty. The response has to include director, writer, and three top casts/crews.
        {{
            "director": "",
            "writer": "",
            "main_cast_1": "",
            "main_cast_2": "",
            "main_cast_2": "",
        }}
    """

    messages = [{
            "role": "system",
            "content": "Please generate output in JSON format exclusively, avoiding any additional text or explanations.",
        },
        {
            "role": "user",
            "content": prompt_template
        }
    ]

    stream = client.chat.completions.create(
        model=llm_model_name,
        messages=messages,
        max_tokens=100,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

def get_favorites_in_qdrant(id_list):

    query_results = qdrant_client.scroll(
        collection_name=collection_name,
        scroll_filter=models.Filter(
            should=[
                models.FieldCondition(
                    key="id",
                    match=models.MatchAny(any=id_list),
                )
            ]
        )
    )

    # print(query_results)
    results = []
    for record in query_results[0]:
        # id = record.id
        payload = record.payload

        tmp = {
            "id": payload['id'],
            "title": payload['title'],
            "summary": payload['summary'],
            "year": payload['year'],
            "certificate": payload['certificate'],
            "genre": payload['genre'],
            "runtime": payload['runtime'],
            "runtime_mins": payload['runtime_mins'],
            "rating": payload['rating'],
            "votes": int(payload['votes']),
            "sentiment": payload['sentiment_normalized'],
            "metadata": payload['metadata'],
            "img": payload['img']
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

def get_bookmarks_in_qdrant(id_list):

    query_results = qdrant_client.scroll(
        collection_name=collection_name,
        scroll_filter=models.Filter(
            should=[
                models.FieldCondition(
                    key="id",
                    match=models.MatchAny(any=id_list),
                )
            ]
        )
    )

    # print(query_results)
    results = []
    for record in query_results[0]:
        # id = record.id
        payload = record.payload

        tmp = {
            "id": payload['id'],
            "title": payload['title'],
            "summary": payload['summary'],
            "year": payload['year'],
            "certificate": payload['certificate'],
            "genre": payload['genre'],
            "runtime": payload['runtime'],
            "runtime_mins": payload['runtime_mins'],
            "rating": payload['rating'],
            "votes": int(payload['votes']),
            "sentiment": payload['sentiment_normalized'],
            "metadata": payload['metadata'],
            "img": payload['img']
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))