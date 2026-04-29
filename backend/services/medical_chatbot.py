import os
import json
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class MedicalChatbot:
    def __init__(self, persist_dir=None, model_name="llama3.2:3b"):
        if persist_dir is None:
            persist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
        
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        if os.path.exists(persist_dir):
            self.vectorstore = Chroma(persist_directory=persist_dir, embedding_function=self.embeddings)
            self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
        else:
            self.vectorstore = None
            self.retriever = None
            print(f"Warning: Chroma directory {persist_dir} not found. Run setup_medical_kb.py first.")

        try:
            self.llm = ChatOllama(
                model=model_name,
                temperature=0,
                base_url="http://localhost:11434",
                num_predict=220,
            )
        except Exception as e:
            self.llm = None
            print(f"Warning: Could not initialize Ollama LLM: {e}")
        
        self.prompt = ChatPromptTemplate.from_template("""
            You are a helpful medical assistant. Answer the user's question based ONLY on the following context.
            If the answer is not in the context, say "I don't have enough information in my current knowledge base to answer that specifically."
            
            Always include this exact disclaimer at the very end of your response:
            "AI-generated medical information – not a substitute for professional advice."

            Context: {context}
            
            Question: {question}
            
            Answer:
        """)
        self.parser = StrOutputParser()

    def _get_context_and_sources(self, question: str):
        docs = self.retriever.invoke(question)
        context = "\n\n".join(doc.page_content for doc in docs)
        sources = list(set([doc.metadata.get('source', 'Unknown') for doc in docs]))
        return context, sources

    def ask(self, question: str) -> dict:
        if not self.retriever or not self.llm:
            return {
                "answer": "Error: Knowledge base not initialized. Please run the setup script.",
                "sources": []
            }
        
        try:
            context, sources = self._get_context_and_sources(question)
            response = self.parser.invoke(
                self.llm.invoke(
                    self.prompt.invoke({
                        "context": context,
                        "question": question
                    })
                )
            )
            
            return {
                "answer": response,
                "sources": sources
            }
        except Exception as e:
            return {
                "answer": f"I'm sorry, I encountered an error: {str(e)}. Please ensure Ollama is running and Llama 3.2 is pulled.",
                "sources": []
            }

    def stream_ask(self, question: str):
        if not self.retriever or not self.llm:
            yield self._sse_event("error", {
                "message": "Error: Knowledge base not initialized. Please run the setup script."
            })
            return

        try:
            context, sources = self._get_context_and_sources(question)
            prompt_value = self.prompt.invoke({
                "context": context,
                "question": question
            })

            yield self._sse_event("sources", {"sources": sources})

            for chunk in self.llm.stream(prompt_value):
                text = getattr(chunk, "content", "")
                if text:
                    yield self._sse_event("token", {"content": text})

            yield self._sse_event("done", {"sources": sources})
        except Exception as e:
            yield self._sse_event("error", {
                "message": f"I'm sorry, I encountered an error: {str(e)}. Please ensure Ollama is running and Llama 3.2 is pulled."
            })

    def _sse_event(self, event_name: str, payload: dict) -> str:
        return f"event: {event_name}\ndata: {json.dumps(payload)}\n\n"

    def get_status(self):
        return {
            "status": "ready" if self.vectorstore else "not_initialized",
            "model_loaded": True,
            "vector_store_size": len(self.vectorstore.get()['ids']) if self.vectorstore else 0
        }
