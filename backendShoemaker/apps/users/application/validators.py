"""
Validators for user-related business rules.
"""
import re
from core.exceptions import ValidationException


class UserValidator:
    """Validator for user-related data."""

    @staticmethod
    def validate_email(email: str) -> None:
        """Validate email format."""
        if not email:
            raise ValidationException("Email is required")

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationException(f"Invalid email format: {email}")

    @staticmethod
    def validate_password(password: str) -> None:
        """
        Validate password strength.
        - At least 8 characters
        - Contains at least one uppercase letter
        - Contains at least one lowercase letter
        - Contains at least one digit
        """
        if not password:
            raise ValidationException("Password is required")

        if len(password) < 8:
            raise ValidationException("Password must be at least 8 characters long")

        if not re.search(r'[A-Z]', password):
            raise ValidationException("Password must contain at least one uppercase letter")

        if not re.search(r'[a-z]', password):
            raise ValidationException("Password must contain at least one lowercase letter")

        if not re.search(r'\d', password):
            raise ValidationException("Password must contain at least one digit")

    @staticmethod
    def validate_phone(phone: str) -> None:
        """Validate phone number format."""
        if not phone:
            return  # Phone is optional

        pattern = r'^\+?1?\d{9,15}$'
        if not re.match(pattern, phone):
            raise ValidationException(
                f"Invalid phone format: {phone}. "
                "Phone should be 9-15 digits, optionally starting with +"
            )

    @staticmethod
    def validate_name(name: str, field_name: str) -> None:
        """Validate name fields (first name, last name)."""
        if not name:
            raise ValidationException(f"{field_name} is required")

        if len(name) < 2:
            raise ValidationException(f"{field_name} must be at least 2 characters long")

        if len(name) > 50:
            raise ValidationException(f"{field_name} must not exceed 50 characters")

    @staticmethod
    def validate_role(role: str) -> None:
        """Validate user role."""
        valid_roles = ['CLIENT', 'DELIVERY', 'ADMIN']
        if role not in valid_roles:
            raise ValidationException(
                f"Invalid role: {role}. Must be one of: {', '.join(valid_roles)}"
            )


class DeliveryPersonValidator:
    """Validator for delivery person-related data."""

    @staticmethod
    def validate_vehicle_type(vehicle_type: str) -> None:
        """Validate vehicle type."""
        valid_types = ['BIKE', 'MOTORCYCLE', 'CAR', 'VAN']
        if vehicle_type not in valid_types:
            raise ValidationException(
                f"Invalid vehicle type: {vehicle_type}. "
                f"Must be one of: {', '.join(valid_types)}"
            )

    @staticmethod
    def validate_license_number(license_number: str) -> None:
        """Validate license number."""
        if not license_number:
            raise ValidationException("License number is required")

        if len(license_number) < 5:
            raise ValidationException("License number must be at least 5 characters long")

    @staticmethod
    def validate_location(latitude: float, longitude: float) -> None:
        """Validate GPS coordinates."""
        if not (-90 <= latitude <= 90):
            raise ValidationException(f"Invalid latitude: {latitude}. Must be between -90 and 90")

        if not (-180 <= longitude <= 180):
            raise ValidationException(f"Invalid longitude: {longitude}. Must be between -180 and 180")
