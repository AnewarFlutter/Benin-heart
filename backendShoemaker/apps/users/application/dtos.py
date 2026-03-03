"""
Data Transfer Objects (DTOs) for the Users application layer.
DTOs are used to transfer data between layers.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class UserDTO:
    """DTO for user data."""
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


@dataclass
class CreateUserDTO:
    """DTO for creating a new user."""
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = 'CLIENT'


@dataclass
class UpdateUserDTO:
    """DTO for updating user information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


@dataclass
class ChangePasswordDTO:
    """DTO for changing user password."""
    old_password: str
    new_password: str


@dataclass
class DeliveryPersonDTO:
    """DTO for delivery person data."""
    user: UserDTO
    vehicle_type: Optional[str]
    license_number: Optional[str]
    is_available: bool
    current_location_lat: Optional[float]
    current_location_lon: Optional[float]


@dataclass
class CreateDeliveryPersonDTO:
    """DTO for creating a delivery person profile."""
    user_id: int
    vehicle_type: str
    license_number: str


@dataclass
class UpdateDeliveryPersonDTO:
    """DTO for updating delivery person information."""
    vehicle_type: Optional[str] = None
    license_number: Optional[str] = None
    is_available: Optional[bool] = None


@dataclass
class UpdateLocationDTO:
    """DTO for updating delivery person location."""
    latitude: float
    longitude: float
