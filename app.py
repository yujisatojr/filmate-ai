from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from langchain.llms import OpenAI
llm = OpenAI(model_name="gpt-3.5-turbo-instruct")
llm("explain large language models in one sentence")

from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)
from langchain.chat_models import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.3)
messages = [
    SystemMessage(content="You are an expert data scientist"),
    HumanMessage(content="Write a Python script that trains a neural network on simulated data")
]
response = chat(messages)
print(response.content, end='\n')

from langchain import PromptTemplate

template = """
You are an expert data scientist with an expertise in building deep learning models.
Explain the concept of {concept} in a couple of lines
"""

prompt = PromptTemplate(
    input_variables=["concept"],
    template=template,
)
print(prompt)

llm(prompt.format(concept="regularization"))

from langchain.chains import LLMChain
chain = LLMChain(llm=llm, prompt=prompt)

# Run the chain only specifying the input variable.
print(chain.invoke("autoencoder"))

second_prompt = PromptTemplate(
    input_variables=["ml_concept"],
    template="Turn the concept description of {ml_concept} and explain it to me like I'm five",
)
chain_two = LLMChain(llm=llm, prompt=second_prompt)

from langchain.chains import SimpleSequentialChain
overall_chain = SimpleSequentialChain(chains=[chain, chain_two], verbose=True)

# Run the chain specifying only the input variable for the first chain.
explanation = overall_chain.invoke("autoencoder")
print(explanation)

from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 100,
    chunk_overlap = 0,
)

explanation_text = explanation.get("output", "")  # Replace "text" with the key containing the text
texts = text_splitter.create_documents([explanation_text])

print(texts)
print(texts[0].page_content)

from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")

query_result = embeddings.embed_query(texts[0].page_content)
print(query_result)

from qdrant_client import QdrantClient

qdrant_client = QdrantClient("localhost", port=6333)

from qdrant_client.http.models import Distance, VectorParams

qdrant_client.create_collection(
    collection_name="test",
    vectors_config=VectorParams(size=4, distance=Distance.DOT),
)

# Define a function to store embeddings in Qdrant
def store_embeddings_in_qdrant(embeddings, object_ids):
    vectors = [{'vector': vector, 'object_id': obj_id} for vector, obj_id in zip(embeddings, object_ids)]
    upsert_request = client.upsert(
        collection_name="test",  # Name of your collection
        vectors=vectors
    )
    client.upsert_entity(upsert_request)

# Insert embeddings in qdrant vector database
object_ids = [i for i in range(len(embeddings))]
store_embeddings_in_qdrant(embeddings, object_ids)