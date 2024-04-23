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

load_dotenv(find_dotenv())
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
)

# Connect to the Qdrant cloud
qdrant_client = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY'),
)

collection_name = 'movies'
vector_name='metadata'

print(qdrant_client.get_collections())
qdrant_client.count(collection_name=collection_name)

# Generate a query embedding and search in Qdrant
def query_qdrant(query, collection_name, vector_name, top_k=12):
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

def parse_user_query(user_query):

    # genres = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sports', 'Thriller', 'War', 'Western']
    
    prompt_template = f"""
        Your task is to parse the following query '{user_query}' provided by a user and generate JSON output according to the template provided later.
        The explanation of each value in the JSON template is as follows:
        "query": For this field, put the user query as is.
        "year": This field represents the release year of the movie. You also need to provide the condition to indicate if the user wants to query a movie before, after, or between specific range of year(s). If any of these values are provided in the query, format it as follows: YYYY. If not specified in the user query, leave the field empty.
        "rating": The rating should be an integer value representing the movie's rating. The rating should be between 1 to 9, but when the user says high rating or higher rating, it means the rating is greater than 8. You also need to provide the condition to indicate if the user wants to query a movie greater than, less than, or between specific range of rating(s). If not specified in the user query, leave the field empty.
        "sentiment": This represents the sentiment of the movie. If the user mentions a term such as 'sad', consider it as 'negative'. If terms like 'happy' is mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.
        "insights": For this field, provide one sentence of brief insights regarding the user's keywords and one sentence of recommendations to the user (use 'you' to refer to the user) on which movies and/or directors the user might like based on the user's keywords. The entire sentence needs to have a friendly tone. If the user query is empty, please also leave this field empty.
        Below is the JSON template:
        {{
            "query": "{user_query}",
            "year": {{
                "year_1": "Please fill out this field if 'condition' value is not empty. Format this field as the following format: YYYY. If not specified in the user query, leave the field empty.",
                "year_2": "Format this field as the following format: YYYY. Only fill in this value when the 'condition' value is between. If not specified in the user query, leave the field empty.",
                "condition": "Fill in one of the following: before, after, between (only if applicable). If this field is applicable, you must also fill out the 'year_1' field. If not specified in the user query, leave the field empty."
            }},
            "rating": {{
                "rating_1": 7 (You have to fill out this field if 'condition' value is not empty. If not specified in the user query, leave null.),
                "rating_2": null (Only fill in this value when the condition is between),
                "condition": "Fill in one of the following: greater_than, less_than, between (if applicable). If this field is applicable, you must also fill out the 'rating_1' field. If not specified in the user query, leave the field empty."
            }},
            "sentiment": "If the user mentions terms such as 'sad' or 'bad', consider it as 'negative'. If terms such as 'happy' or 'good' are mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.",
            "insights": "Movies about space adventure offer thrilling escapades into the unknown, showcasing the wonders and dangers of exploring the cosmos. You might enjoy classics like "Star Wars" directed by George Lucas or the visually stunning "Interstellar" directed by Christopher Nolan for epic space journeys that will leave you awe-inspired."
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
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=500,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

# def get_movie_news(movie_title):

#     prompt_template = f"""
#         Your task is to provide up to 3 related news article information about this movie: {movie_title} in the JSON format. 
#         Within the JSON template, headline represents the brief, one sentence summarization of the news articles, and source is the valid URL link to the article online.
#         Below is the JSON template:
#         {{
#             "headline": "Jordan Peele Reveals Poster and Killer Cast for New Horror Flick",
#             "source": "https://screenrant.com/godzilla-x-kong-monsterverse-sequel-updates/",
#         }}
#     """

#     print(prompt_template)

#     messages = [{
#             "role": "system",
#             "content": "Please generate output in JSON format exclusively, avoiding any additional text or explanations.",
#         },
#         {
#             "role": "user",
#             "content": prompt_template
#         }
#     ]

#     print(messages)

#     stream = client.chat.completions.create(
#         model="gpt-3.5-turbo-0125",
#         messages=messages,
#         max_tokens=100,
#         temperature=0.5,
#         frequency_penalty=0,
#         presence_penalty=0,
#         response_format={ "type": "json_object" }
#     )
#     return json.loads(stream.choices[0].message.content)

def get_movie_news(movie_title):

    prompt_template = f"""
        Your task is to provide 3 related news article information about this movie: {movie_title} in the JSON format. Within the JSON template, headline represents the brief, one sentence summarization of the news articles. Make each sentence around 25 words long.
        {{
            "headline_1": "Christopher Nolan's Mind-Bending Thriller 'Inception' Turns 10: Celebrating a Decade of Dreams Within Dreams",
            "headline_2": "Exploring the Legacy: How 'Inception' Revolutionized the Science Fiction Genre and Inspired Filmmakers Worldwide",
            "headline_3": "Unraveling the Mysteries: Fans and Theorists Still Debate the Ambiguous Ending of 'Inception' 10 Years Later",
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
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=250,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

def get_movie_trailer(movie_title):

    messages = [{
            "role": "system",
            "content": "Please generate output in JSON format exclusively, avoiding any additional text or explanations.",
        },
        {
            "role": "user",
            "content": f"Provide me an URL link to the official trailer of the following movie from YouTube: '{movie_title}'. If the video does not exist on YouTube, return an empty string."
        }
    ]

    stream = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=100,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

def get_movie_casts(movie_title):

    prompt_template = f"""
        Your task is to provide up to 5 main cast names of this movie: '{movie_title}' in the following JSON format. If the name is unknown, leave the field empty. The response has to include director, writer, and three top casts/crews.
        {{
            "director": "Quentin Tarantino",
            "writer": "Quentin Tarantino",
            "main_cast_1": "Jamie Foxx",
            "main_cast_2": "Christoph Waltz",
            "main_cast_2": "Leonardo DiCaprio",
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
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=100,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    return json.loads(stream.choices[0].message.content)

def create_filter(parsed_query):

    print('FILTER GENERATED')
    print(parsed_query)

    data = json.loads(parsed_query)

    # Extract original user query
    user_query = data['query']

    # Mapping values to variables
    year_value_1 = data['year']['year_1']
    year_value_2 = data['year']['year_2']
    year_condition = data['year']['condition']
    
    rating_value_1 = data['rating']['rating_1']
    rating_value_2 = data['rating']['rating_2']
    rating_condition = data['rating']['condition']

    # genre = data['genre']
    sentiment = data['sentiment']
    
    # Build filter conditions
    filter_conditions = []

    # Add default search condition
    if not user_query.strip():  # Check if the query contains only whitespace characters
        filter_conditions.append(models.FieldCondition(
            key="year",
            range=models.Range(
                gte=2024,
            )
        ))
        # filter_conditions.append(models.FieldCondition(
        #         key="rating",
        #         range=models.Range(
        #             gte=7,
        #         )
        #     ))
        # filter_conditions.append(models.FieldCondition(
        #         key="votes",
        #         range=models.Range(
        #             gte=150000,
        #         )
        #     ))
    
    if year_condition is not None and year_condition != '' and year_value_1 != '':
        if year_condition == 'after':
            filter_conditions.append(models.FieldCondition(
                key="year",
                range=models.Range(
                    gt=year_value_1,
                )
            ))
        elif year_condition == 'before':
            filter_conditions.append(models.FieldCondition(
                key="year",
                range=models.Range(
                    lt=year_value_1,
                )
            ))
        elif year_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="year",
                range=models.Range(
                    gt=year_value_1,
                    lt=year_value_2,
                )
            ))

    if rating_condition is not None and rating_condition != '' and rating_value_1 != '':
        filter_conditions.append(models.FieldCondition(
            key="votes",
            range=models.Range(
                gt=2000,
            )
        ))
        
        if rating_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    gt=rating_value_1,
                )
            ))
        elif rating_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    lt=rating_value_1,
                )
            ))
        elif rating_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    gt=rating_value_1,
                    lt=rating_value_2,
                )
            ))

    # if genre is not None and genre != '':
    #     filter_conditions.append(models.FieldCondition(
    #         key="genre",
    #         match=models.MatchValue(value=genre),
    #     ))

    if sentiment is not None and sentiment != '':
        if sentiment == 'positive':
            filter_conditions.append(models.FieldCondition(
                key="sentiment",
                range=models.Range(
                    gt=0,
                )
            ))
        elif sentiment == 'negative':
            filter_conditions.append(models.FieldCondition(
                key="sentiment",
                range=models.Range(
                    lt=0,
                )
            ))

    return filter_conditions

def search_qdrant(metadata, collection_name, vector_name, top_k=5):
    
    completion = openai.embeddings.create(
        input=metadata,
        model='text-embedding-3-small'  # Be sure to use the same embedding model as the vectors in the collection
    )
    
    embedded_query = completion.data[0].embedding

    query_results = qdrant_client.search(
        collection_name=collection_name,
        search_params=models.SearchParams(hnsw_ef=128, exact=False),
        query_vector=(
            vector_name, embedded_query
        ),
        limit=top_k,
    )
    
    return query_results

def search_filtered_vector(parsed_query, collection_name, vector_name, top_k=12):

    filter_conditions = create_filter(parsed_query)

    json_parsed = json.loads(parsed_query)
    user_query = json_parsed['query']
    
    completion = openai.embeddings.create(
        input=user_query,
        model='text-embedding-3-small'  # Be sure to use the same embedding model as the vectors in the collection
    )
    
    embedded_query = completion.data[0].embedding

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

# Format the response as json
def format_time_to_minutes(minutes_float):
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

def convert_utc_to_mm_dd_yyyy(utc_datetime_str):
    utc_datetime = datetime.strptime(utc_datetime_str, "%Y-%m-%dT%H:%M:%SZ")

    mm_dd_yyyy_format = utc_datetime.strftime("%m-%d-%Y")
    
    return mm_dd_yyyy_format

# Search for similar vectors
def search_movies_in_qdrant(parsed_query):

    # json_query = json.loads(parsed_query)
    json_query = json.dumps(parsed_query)

    query_results = search_filtered_vector(json_query, collection_name, vector_name)

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "year": vector.payload["year"],
            "certificate": vector.payload["certificate"],
            "genre": vector.payload["genre"],
            "runtime": vector.payload["runtime"],
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "sentiment": vector.payload["sentiment"],
            "metadata": vector.payload["metadata"],
            "img": vector.payload["img"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

# Search for similar movies
def search_similar_in_qdrant(metadata):

    query_results = search_qdrant(metadata, collection_name, vector_name)

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "year": vector.payload["year"],
            "certificate": vector.payload["certificate"],
            "genre": vector.payload["genre"],
            "runtime": vector.payload["runtime"],
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "sentiment": vector.payload["sentiment"],
            "metadata": vector.payload["metadata"],
            "img": vector.payload["img"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))