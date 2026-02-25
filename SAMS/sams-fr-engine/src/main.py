from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router

app = FastAPI(title="SAMS Facial Recognition Engine API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1/fr")

@app.get("/")
def read_root():
    return {"message": "SAMS Facial Recognition Engine API is running"}
