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
def query_qdrant(query, collection_name, vector_name, top_k=5):
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

    country_names = ['English', 'French', 'Chinese', 'Italian', 'Persian', 'Dutch', 'German', 'Arabic', 'Spanish', 'Russian', 'Swedish', 'Japanese', 'Korean', 'Serbian', 'Bengali', 'Hebrew', 'Portuguese', 'Wolof', 'Romanian', 'Hungarian', 'Welsh', 'Vietnamese']

    genres = ['Animation', 'Action', 'Comedy', 'Biography', 'Crime', 'Drama', 'Adventure', 'Fantasy', 'Mystery', 'Sci-Fi', 'Documentary', 'Horror', 'Family', 'Romance', 'Film-Noir', 'Western', 'Musical', 'Thriller', 'War', 'Short', 'Music']
    
    prompt_template = f"""
        Your task is to parse the following query "{user_query}" provided by a user and generate JSON output according to the template provided later.\n
        The explanation of each value in the JSON template is as follows:\n
        "date": "This field represents the release year, month, and/or date of the movie. You also need to provide the condition to indicate if user wants to query a movie before, after, or between specific range of date(s). If any of these values are provided in the query, format it as follows: 2005-02-08T10:49:00Z. If not specified, leave empty.",
        "genres": "This field represents the genre of the movie. If user mention one the following genres in the list '{genres}', add it as a value. If not specified, please leave empty.",
        "runtime": "The runtime should be an integer value representing the duration of the movie in minutes. You also need to provide the condition to indicate if user wants to query a movie greater than, less than, or between specific range of time or timeframe. If not specified, leave empty.",
        "rating": "The rating should be an integer value representing the movie's rating. The rating should be between 1 to 9, but when user says high rating or higher rating, it means rating is greater than 8. You also need to provide the condition to indicate if user wants to query a movie greater than, less than, or between specific range of rating(s). If not specified, leave empty.",
        "budget": "The budget should be an integer value representing the movie's budget. You also need to provide the condition to indicate if user wants to query a movie greater than, less than, or between specific range of budget. If not specified, leave empty.",
        "revenue": "The revenue should be an integer value representing the movie's revenue. You also need to provide the condition to indicate if user wants to query a movie greater than, less than, or between specific range of revenue. If not specified, leave empty.",
        "sentiment": "Please analyze the sentiment of the movie. If the user mentions terms like 'sad' or 'bad', consider it as 'negative'. If terms like 'happy' or 'good' are mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.",
        "language": "The language should be from the following list: {country_names}. If not specified, leave empty."\n
        Below is the JSON tempalte:
        {{
            "date": {{
                "value_1": "2005-02-08T10:49:00Z",
                "value_2": "2005-02-08T10:49:00Z (only fill in this value when the condition is between)",
                "condition": "one of the following: before, after, between"
            }},
            "genres":  "one of the values from the following list '{genres}'. If not specified, leave empty.",
            "runtime": {{
                "value_1": 180,
                "value_2": null (only fill in this value when the condition is between),
                "condition": "one of the following: greater_than, less_than, between. If not specified, leave empty."
            }},
            "rating": {{
                "value_1": null,
                "value_2": null (only fill in this value when the condition is between),
                "condition": "one of the following: greater_than, less_than, between. If not specified, leave empty."
            }},
            "budget": {{
                "value_1": 3500000,
                "value_2": 6500000 (only fill in this value when the condition is between),
                "condition": "one of the following: greater_than, less_than, between. If not specified, leave empty."
            }},
            "revenue": {{
                "value_1": 3500000,
                "value_2": 6500000 (only fill in this value when the condition is between),
                "condition": "one of the following: greater_than, less_than, between. If not specified, leave empty."
            }},
            "sentiment":  "If the user mentions terms like 'sad' or 'bad', consider it as 'negative'. If terms like 'happy' or 'good' are mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.",
            "language":  "one of the values from the following list '{country_names}'. If not specified, leave empty."
        }}
    """

    messages = [{
            "role": "system",
            "content": "You are a helpful assistant designed to output only in JSON format. No other text or explanation.",
        },
        {
            "role": "user",
            "content": prompt_template
        }
    ]

    stream = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        # stream=True,
        # temperature=0.7,
        # max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        # stop=None,
        response_format={"type": "json_object"}
    )
    return json.loads(stream.choices[0].message.content)

def create_filter(user_query):
    parsed = json.dumps(parse_user_query(user_query))

    print('Filters:')
    print(parsed)

    data = json.loads(parsed)

    # Mapping values to variables
    date_value_1 = data['date']['value_1']
    date_value_2 = data['date']['value_2']
    date_condition = data['date']['condition']
    
    runtime_value_1 = data['runtime']['value_1']
    runtime_value_2 = data['runtime']['value_2']
    runtime_condition = data['runtime']['condition']
    
    rating_value_1 = data['rating']['value_1']
    rating_value_2 = data['rating']['value_2']
    rating_condition = data['rating']['condition']
    
    budget_value_1 = data['budget']['value_1']
    budget_value_2 = data['budget']['value_2']
    budget_condition = data['budget']['condition']
    
    revenue_value_1 = data['revenue']['value_1']
    revenue_value_2 = data['revenue']['value_2']
    revenue_condition = data['revenue']['condition']

    genres = data['genres']
    sentiment = data['sentiment']
    language = data['language']
    
    # Build filter conditions
    filter_conditions = []
    
    if date_condition is not None and date_condition != '':
        if date_condition == 'after':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    gt=date_value_1, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif date_condition == 'before':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    gt=None,
                    gte=None,
                    lt=date_value_1,
                    lte=None,
                )
            ))
        elif date_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    gt=date_value_1,
                    gte=None,
                    lt=date_value_2,
                    lte=None,
                )
            ))

    if runtime_condition is not None and runtime_condition != '':
        if runtime_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    gt=runtime_value_1, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif runtime_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    gt=None,
                    gte=None,
                    lt=runtime_value_1,
                    lte=None,
                )
            ))
        elif runtime_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    gt=runtime_value_1,
                    gte=None,
                    lt=runtime_value_2,
                    lte=None,
                )
            ))

    if rating_condition is not None and rating_condition != '':
        filter_conditions.append(models.FieldCondition(
            key="votes",
            range=models.Range(
                gt=2000, # greater than
                gte=None, # greater than or equal
                lt=None, # less than
                lte=None, # less than or equal
            )
        ))
        
        if rating_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    gt=rating_value_1, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif rating_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    gt=None,
                    gte=None,
                    lt=rating_value_1,
                    lte=None,
                )
            ))
        elif rating_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="rating",
                range=models.Range(
                    gt=rating_value_1,
                    gte=None,
                    lt=rating_value_2,
                    lte=None,
                )
            ))

    if budget_condition is not None and budget_condition != '':
        if budget_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    gt=budget_value_1, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif budget_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    gt=None,
                    gte=None,
                    lt=budget_value_1,
                    lte=None,
                )
            ))
        elif budget_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    gt=budget_value_1,
                    gte=None,
                    lt=budget_value_2,
                    lte=None,
                )
            ))

    if revenue_condition is not None and revenue_condition != '':
        if revenue_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    gt=revenue_value_1, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif revenue_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    gt=None,
                    gte=None,
                    lt=revenue_value_1,
                    lte=None,
                )
            ))
        elif revenue_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    gt=revenue_value_1,
                    gte=None,
                    lt=revenue_value_2,
                    lte=None,
                )
            ))

    if genres is not None and genres != '':
        filter_conditions.append(models.FieldCondition(
            key="genres",
            match=models.MatchValue(value=genres),
        ))

    if sentiment is not None and sentiment != '':
        if sentiment == 'positive':
            filter_conditions.append(models.FieldCondition(
                key="sentiment_score",
                range=models.Range(
                    gt=0, # greater than
                    gte=None, # greater than or equal
                    lt=None, # less than
                    lte=None, # less than or equal
                )
            ))
        elif sentiment == 'negative':
            filter_conditions.append(models.FieldCondition(
                key="sentiment_score",
                range=models.Range(
                    gt=None,
                    gte=None,
                    lt=0,
                    lte=None,
                )
            ))

    if language is not None and language != '':
        filter_conditions.append(models.FieldCondition(
            key="language",
            match=models.MatchValue(value=language),
        ))

    return filter_conditions

def search_filtered_vector(user_query, collection_name, vector_name, top_k=5):

    filter_conditions = create_filter(user_query)
    
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
def search_movies_in_qdrant(user_query):
    query_results = search_filtered_vector(user_query, collection_name, vector_name)

    results = []
    
    for i, vector in enumerate(query_results):
        tmp = {
            "rank": i,
            "title": vector.payload["title"],
            "summary": vector.payload["summary"],
            "date": convert_utc_to_mm_dd_yyyy(vector.payload["date"]),  # convert this to MM-DD-YYYY format
            "genres": vector.payload["genres"],
            "runtime": format_time_to_minutes(vector.payload["runtime"]),
            "rating": vector.payload["rating"],
            "votes": int(vector.payload["votes"]),
            "budget": format_as_dollars(vector.payload["budget"]),
            "revenue": format_as_dollars(vector.payload["revenue"]),
            "language": vector.payload["language"],
            "production": vector.payload["production"],
            "poster_link": vector.payload["poster_link"]
        }
        results.append(tmp)

    return (json.loads(json.dumps(results)))

# def main():
#     user_query = input("Please enter your query: ")

#     response = (search_movies_in_qdrant(user_query))
#     json_string = json.dumps(response, indent=2)

#     print(json_string)

# if __name__ == "__main__":
#     main()