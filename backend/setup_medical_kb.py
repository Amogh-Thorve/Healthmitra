import os
import requests
import json
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def fetch_openfda_data(drug_name="ibuprofen"):
    """Fetch drug label info from openFDA API."""
    print(f"Fetching openFDA data for {drug_name}...")
    url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{drug_name}&limit=1"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                result = data["results"][0]
                text_content = ""
                for key in ["indications_and_usage", "dosage_and_administration", "warnings"]:
                    if key in result:
                        text_content += f"\n\n{key.replace('_', ' ').capitalize()}:\n{result[key][0]}"
                
                file_path = os.path.join(DATA_DIR, f"fda_{drug_name}.txt")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(text_content.strip())
                print(f"Saved openFDA data to {file_path}")
                return True
    except Exception as e:
        print(f"Error fetching openFDA data: {e}")
    return False

def fetch_pubmed_sample():
    """Placeholder for PubMed fetching. Real implementation would use Entrez API."""
    # For demo purposes, we rely on the pre-created pubmed_sample.txt
    print("PubMed sample fetching is simulated via local files.")
    pass

def setup_knowledge_base():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"Created {DATA_DIR}")

    # Fetch some external data
    fetch_openfda_data("ibuprofen")
    fetch_openfda_data("paracetamol")

    # Load documents
    print("Loading documents from data directory...")
    loader = DirectoryLoader(DATA_DIR, glob="*.txt", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
    documents = loader.load()
    print(f"Loaded {len(documents)} documents.")

    # Split documents
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    # Initialize embeddings
    print(f"Initializing embedding model: {EMBEDDING_MODEL}...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # Create and persist vector store
    print(f"Creating vector store at {CHROMA_DB_DIR}...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR
    )
    print("Knowledge base setup complete!")

if __name__ == "__main__":
    setup_knowledge_base()
