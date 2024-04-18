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
def query_qdrant(query, collection_name, vector_name, top_k=15):
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
        Your task is to parse the following query '{user_query}' provided by a user and generate JSON output according to the template provided later.
        The explanation of each value in the JSON template is as follows:
        "query": For this field, put the user query as is.
        "date": This field represents the release year, month, and/or date of the movie. You also need to provide the condition to indicate if the user wants to query a movie before, after, or between specific range of date(s). If any of these values are provided in the query, format it as follows: 2005-02-08T10:49:00Z. If not specified in the user query, leave the field empty.
        "genres": This field represents the genre of the movie. If the user mentions one of the following genres in the list '{genres}', add it as a value. If not specified in the user query, please leave the field empty.
        "runtime": The runtime should be an integer value representing the duration of the movie in minutes. You also need to provide the condition to indicate if the user wants to query a movie greater than, less than, or between specific range of time. If not specified in the user query, leave the field empty.
        "rating": The rating should be an integer value representing the movie's rating. The rating should be between 1 to 9, but when the user says high rating or higher rating, it means the rating is greater than 8. You also need to provide the condition to indicate if the user wants to query a movie greater than, less than, or between specific range of rating(s). If not specified in the user query, leave the field empty.
        "budget": The budget should be an integer value representing the movie's budget in dollars. You also need to provide the condition to indicate if the user wants to query a movie greater than, less than, or between specific range of budget. If not specified in the user query, leave the field empty.
        "revenue": The revenue should be an integer value representing the movie's revenue in dollars. You also need to provide the condition to indicate if the user wants to query a movie greater than, less than, or between specific range of revenue. If not specified in the user query, leave the field empty.
        "sentiment": This represents the sentiment of the movie. If the user mentions terms such as 'sad' or 'bad', consider it as 'negative'. If terms like 'happy' or 'good' are mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.
        "language": This represents the language of the movie. The language should be from the following list: {country_names}. If not specified in the user query, leave the field empty.
        Below is the JSON template:
        {{
            "query": "{user_query}",
            "date": {{
                "date_1": "Please fill out this field if 'condition' value is not empty. Format this field as the following format: 2005-02-08T10:49:00Z. If not specified in the user query, leave the field empty.",
                "date_2": "Format this field as the following format: 2005-02-08T10:49:00Z. Only fill in this value when the 'condition' value is between. If not specified in the user query, leave the field empty.",
                "condition": "Fill in one of the following: before, after, between (only if applicable). If this field is applicable, you must also fill out the 'date_1' field. If not specified in the user query, leave the field empty."
            }},
            "genres": "One of the values from the following list '{genres}', only if applicable. If not specified in the user query, leave the field empty.",
            "runtime": {{
                "runtime_1": 180 (You have to fill out this field if 'condition' value is not empty. If not specified in the user query, leave null.),
                "runtime_2": null (Only fill in this field when the 'condition' field is 'between'.),
                "condition": "Fill in one of the following: greater_than, less_than, between (if applicable). If this field is applicable, you must also fill out the 'runtime_1' field. If not specified in the user query, leave the field empty."
            }},
            "rating": {{
                "rating_1": 7 (You have to fill out this field if 'condition' value is not empty. If not specified in the user query, leave null.),
                "rating_2": null (Only fill in this value when the condition is between),
                "condition": "Fill in one of the following: greater_than, less_than, between (if applicable). If this field is applicable, you must also fill out the 'rating_1' field. If not specified in the user query, leave the field empty."
            }},
            "budget": {{
                "budget_1": 3500000 (You have to fill out this field if 'condition' value is not empty. If not specified in the user query, leave null.),
                "budget_2": 6500000 (Only fill in this value when the 'condition' field is 'between'),
                "condition": "Fill in one of the following: greater_than, less_than, between (if applicable). If this field is applicable, you must also fill out the 'budget_1' field. If not specified in the user query, leave the field empty."
            }},
            "revenue": {{
                "revenue_1": 3500000 (You have to fill out this field if 'condition' value is not empty. If not specified in the user query, leave null.),
                "revenue_2": 6500000 (Only fill in this value when the 'condition' field is 'between'),
                "condition": "One of the following: greater_than, less_than, between (if applicable). If this field is applicable, you must also fill out the 'revenue_1' field. If not specified in the user query, leave the field empty."
            }},
            "sentiment": "If the user mentions terms such as 'sad' or 'bad', consider it as 'negative'. If terms such as 'happy' or 'good' are mentioned, consider it as 'positive'. If sentiment is not specified in the user query, leave it empty.",
            "language": "One of the values from the following list '{country_names}', if applicable. If not specified in the user query, leave the field empty."
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

def create_filter(parsed_query):

    print('FILTER GENERATED')
    print(parsed_query)

    data = json.loads(parsed_query)

    # Extract original user query
    user_query = data['query']

    # Mapping values to variables
    date_value_1 = data['date']['date_1']
    date_value_2 = data['date']['date_2']
    date_condition = data['date']['condition']
    
    runtime_value_1 = data['runtime']['runtime_1']
    runtime_value_2 = data['runtime']['runtime_2']
    runtime_condition = data['runtime']['condition']
    
    rating_value_1 = data['rating']['rating_1']
    rating_value_2 = data['rating']['rating_2']
    rating_condition = data['rating']['condition']
    
    budget_value_1 = data['budget']['budget_1']
    budget_value_2 = data['budget']['budget_2']
    budget_condition = data['budget']['condition']
    
    revenue_value_1 = data['revenue']['revenue_1']
    revenue_value_2 = data['revenue']['revenue_2']
    revenue_condition = data['revenue']['condition']

    genres = data['genres']
    sentiment = data['sentiment']
    language = data['language']
    
    # Build filter conditions
    filter_conditions = []

    # Add default search condition
    if not user_query.strip():  # Check if the query contains only whitespace characters
        filter_conditions.append(models.FieldCondition(
            key="rating",
            range=models.Range(
                gt=8, # greater than
                gte=None, # greater than or equal
                lt=None, # less than
                lte=None, # less than or equal
            )
        ))
        filter_conditions.append(models.FieldCondition(
            key="votes",
            range=models.Range(
                gt=5000,
                gte=None,
                lt=None,
                lte=None,
            )
        ))
    
    if date_condition is not None and date_condition != '' and date_value_1 != '':
        if date_condition == 'after':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    gt=date_value_1,
                )
            ))
        elif date_condition == 'before':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    lt=date_value_1,
                )
            ))
        elif date_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="date",
                range=models.DatetimeRange(
                    gt=date_value_1,
                    lt=date_value_2,
                )
            ))

    if runtime_condition is not None and runtime_condition != '' and runtime_value_1 != '':
        if runtime_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    gt=runtime_value_1,
                )
            ))
        elif runtime_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    lt=runtime_value_1,
                )
            ))
        elif runtime_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="runtime",
                range=models.Range(
                    gt=runtime_value_1,
                    lt=runtime_value_2,
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

    if budget_condition is not None and budget_condition != '' and budget_value_1 != '':
        if budget_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    gt=budget_value_1,
                )
            ))
        elif budget_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    lt=budget_value_1,
                )
            ))
        elif budget_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="budget",
                range=models.Range(
                    gt=budget_value_1,
                    lt=budget_value_2,
                )
            ))

    if revenue_condition is not None and revenue_condition != '' and revenue_value_1 != '':
        if revenue_condition == 'greater_than':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    gt=revenue_value_1,
                )
            ))
        elif revenue_condition == 'less_than':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    lt=revenue_value_1,
                )
            ))
        elif revenue_condition == 'between':
            filter_conditions.append(models.FieldCondition(
                key="revenue",
                range=models.Range(
                    gt=revenue_value_1,
                    lt=revenue_value_2,
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
                    gt=0,
                )
            ))
        elif sentiment == 'negative':
            filter_conditions.append(models.FieldCondition(
                key="sentiment_score",
                range=models.Range(
                    lt=0,
                )
            ))

    if language is not None and language != '':
        filter_conditions.append(models.FieldCondition(
            key="language",
            match=models.MatchValue(value=language),
        ))

    return filter_conditions

def search_filtered_vector(parsed_query, collection_name, vector_name, top_k=15):

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