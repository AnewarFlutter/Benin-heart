"""
Data Transfer Objects (DTOs) for the Contact application layer.
DTOs describe the input/output payloads for contact use cases.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from uuid import UUID


@dataclass
class ContactDTO:
    """DTO representing a contact message."""
    id: Optional[int]
    uuid: Optional[UUID]
    name: str
    email: str
    phone: Optional[str]
    sujet: str
    message: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class CreateContactDTO:
    """DTO for creating a new contact message."""
    name: str
    email: str
    phone: Optional[str]
    sujet: str
    message: str
