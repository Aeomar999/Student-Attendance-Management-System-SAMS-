from fastapi import APIRouter
from src.schemas.requests import (
    RecognizeRequest, BatchRecognizeRequest, VerifyRequest, DetectRequest, EmbedRequest
)
from src.services.face_service import FaceService

router = APIRouter()

@router.post("/recognize")
async def recognize_face(request: RecognizeRequest):
    data = await FaceService.process_face_recognition(
        request.sessionId, request.image, request.metadata.dict() if request.metadata else {}
    )
    return {"success": True, "data": data}

@router.post("/recognize/batch")
async def batch_recognize(request: BatchRecognizeRequest):
    data = await FaceService.process_batch_recognition(
        request.sessionId, [img.dict() for img in request.images], request.options.dict() if request.options else {}
    )
    return {"success": True, "data": data}

@router.post("/verify")
async def verify_face(request: VerifyRequest):
    data = await FaceService.verify_face(
        request.studentId, request.image, request.options.dict() if request.options else {}
    )
    return {"success": True, "data": data}

@router.post("/detect")
async def detect_faces(request: DetectRequest):
    data = await FaceService.detect_faces(
        request.image, request.options.dict() if request.options else {}
    )
    return {"success": True, "data": data}

@router.post("/embed")
async def generate_embedding(request: EmbedRequest):
    data = await FaceService.generate_embeddings(
        request.studentId, request.images, request.replace
    )
    return {"success": True, "data": data}

@router.get("/health")
async def get_health():
    data = await FaceService.get_health()
    return {"success": True, "data": data}
