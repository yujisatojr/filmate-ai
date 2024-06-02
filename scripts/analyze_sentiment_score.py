# This script will assign a sentiment score and justification based on the synopsis of each movie and export the results as a CSV file.
import pandas as pd
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI
import openai
import json
import os
from tqdm import tqdm
import pandas as pd

load_dotenv(find_dotenv())

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
)

llm_model_name="gpt-3.5-turbo-0125"

# Read the CSV dataset
file_path = '../datasets/latest.csv'
df = pd.read_csv(file_path) # Add .head(100) if you want to limit the number of rows

df = df.fillna('')

print(str(len(df)) + ' rows')

tqdm.pandas()

def analyze_sentiment(title, synopsis):

    prompt_template = f"""
        For the following movie title '{title}' and its synopsis '{synopsis}', analyze the synopsis of the movie and assign a sentiment score ranging from 0 to 10 (0 being extremely sad/negative, 1 being very sad, 2 being sad/negative, 3 being somewhat sad, 4 being sad closer to neutral, 5 being neutral, 6 being happy/positive closer to neutral, 7 being somewhat happy/positive, 8 being happy/positive, 9 being very happy, 10 being extremely happy/positive). 
        Consider the emotional tone of the synopsis, especially how the movie concludes. If the movie has a bittersweet or mature content/ending, take into account themes of sacrifice, loss, or unresolved conflicts, and assign a lower score. 
        Additionally, if the movie tackles controversial themes such as slavery, abortion, or war, consider lowering the score accordingly.
        Only provide a sentiment score along with a specific and insightful justification/reasoning as to why the movie received with the score and recommended audience in about 30 words. Output needs to be in a JSON format.
        
        Example JSON Output:
        {{
        	"Sentiment Score": 3,
        	"Justification": "This film depicts a poignant love story set against the backdrop of societal expectations and restrictions. The themes of love, sacrifice, and longing contribute to a somewhat sad and bittersweet overall tone.",
        	"Recommended Audience": "This film may resonate with viewers who enjoy slow-burn romance narratives and are open to exploring themes of societal constraints and the complexities of human relationships."
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
        max_tokens=200,
        temperature=0.5,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={ "type": "json_object" }
    )
    
    return json.loads(stream.choices[0].message.content)

def shorten_string(text, max_length=1000, keep=500):
    if len(text) <= max_length:
        return text
    else:
        first_part = text[:keep]
        last_part = text[-keep:]
        return first_part + "..." + last_part

# Function to apply sentiment analysis and update DataFrame
def apply_sentiment_analysis(row):
    try:
        result = analyze_sentiment(row['title'], shorten_string(row['synopsis']))
        row['sentiment_score'] = result.get('Sentiment Score', '')
        row['sentiment_reason'] = result.get('Justification', '')
        row['recommended_audience'] = result.get('Recommended Audience', '')
    except Exception as e:
        print(f"Error processing row: {e}")
        row['sentiment_score'] = ''
        row['sentiment_reason'] = ''
        row['recommended_audience'] = ''
    return row

# Define a function to handle apply with backup
def apply_with_backup(func, df, *args, **kwargs):
    try:
        return df.progress_apply(func, *args, **kwargs)
    except Exception as e:
        print(f"Error occurred: {e}")
        print("Saving the data up to this point as backup.csv")
        df.to_csv("backup.csv", index=False)
        raise e

# Create empty columns
df['sentiment_score'] = ''
df['sentiment_reason'] = ''
df['recommended_audience'] = ''

# Apply sentiment analysis function to each row with tqdm progress bar and backup
df = apply_with_backup(apply_sentiment_analysis, df, axis=1)

df.head()

file_path = 'latest_with_sentiment_score.csv'
df.to_csv(file_path, index=False)