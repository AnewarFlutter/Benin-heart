from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from uuid import UUID


@dataclass
class ContactEntity:
    id: Optional[int]
    uuid: Optional[UUID]
    name: str
    email: str
    phone: Optional[str]
    sujet: str
    message: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
