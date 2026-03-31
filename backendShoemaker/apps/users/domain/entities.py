"""
Domain entities for the Users bounded context.
Entities are pure Python objects with no dependencies on frameworks.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class UserEntity:
    """
    User entity representing a user in the system.
    This is a pure domain object without any framework dependencies.
    """
    id: Optional[int]
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: str  # CLIENT, ADMIN
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def get_full_name(self) -> str:
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}".strip()

    def is_client(self) -> bool:
        """Check if user is a client."""
        return self.role == 'CLIENT'

    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == 'ADMIN'

#ici c'est les regle de gestion des entités et mon entité est pure pas de dépendance avec un framework comme django ou autre