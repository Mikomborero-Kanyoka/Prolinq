from fastapi import FastAPI
import os

# Create minimal FastAPI app
app = FastAPI(
    title="Prolinq API", 
    version="1.0.0",
    description="API for Prolinq job matching platform"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Prolinq API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 Minimal Prolinq API starting...")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Minimal Prolinq API shutting down...")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
