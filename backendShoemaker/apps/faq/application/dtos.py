from dataclasses import dataclass
from typing import Optional
from datetime import datetime



@dataclass
class CreateFaqDto:
    question: str
    answer: str



@dataclass
class UpdateFaqDto:
    id: int
    question: str
    answer: str



@dataclass
class DeleteFaqDto:
    id: int


@dataclass
class FaqResponseDto:
    id: int
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime


# =============================
# ENTITY (couche domaine)
# =============================
@dataclass
class FaqEntity:
    id: Optional[int]
    question: str
    answer: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
