from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RecognizeMetadata(BaseModel):
    frameNumber: Optional[int] = None
    timestamp: Optional[str] = None
    cameraId: Optional[str] = None

class RecognizeRequest(BaseModel):
    sessionId: str
    image: str
    metadata: Optional[RecognizeMetadata] = None

class BatchImage(BaseModel):
    id: str
    data: str

class BatchOptions(BaseModel):
    skipLiveness: Optional[bool] = False
    qualityThreshold: Optional[float] = 0.7

class BatchRecognizeRequest(BaseModel):
    sessionId: str
    images: List[BatchImage]
    options: Optional[BatchOptions] = None

class VerifyOptions(BaseModel):
    requireLiveness: Optional[bool] = True
    threshold: Optional[float] = 0.45

class VerifyRequest(BaseModel):
    studentId: str
    image: str
    options: Optional[VerifyOptions] = None

class DetectOptions(BaseModel):
    returnLandmarks: Optional[bool] = True
    qualityCheck: Optional[bool] = True

class DetectRequest(BaseModel):
    image: str
    options: Optional[DetectOptions] = None

class EmbedRequest(BaseModel):
    studentId: str
    images: List[str]
    replace: Optional[bool] = False
