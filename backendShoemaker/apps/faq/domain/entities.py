from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass

class FaqEntity:
    id: Optional[int]
    question: str
    answer: str
    created_at: Optional[datetime] = None
    updated_at:Optional[datetime] = None
