"""
Domain services for Users bounded context.
Contains business logic that doesn't belong to a single entity.
"""
from typing import Optional
import random
import string
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from core.exceptions import ValidationException, AlreadyExistsException, NotFoundException
from .entities import UserEntity, DeliveryPersonEntity
from .repositories import IUserRepository, IDeliveryPersonRepository


class UserService:
    """
    Domain service for user-related business logic.
    """

    def __init__(self, user_repository: IUserRepository): 
        self.user_repository = user_repository

    def validate_user_creation(self, email: str) -> None:
        """
        Validate if a user can be created.
        Raises AlreadyExistsException if email is already taken.
        """
        if self.user_repository.exists_by_email(email):
            raise AlreadyExistsException("User", f"email '{email}'")

    def validate_email_format(self, email: str) -> None:
        """Validate email format."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationException(f"Invalid email format: {email}")

    def validate_phone_format(self, phone: str) -> None:
        """Validate phone number format."""
        if not phone:
            return
        import re
        pattern = r'^\+?1?\d{9,15}$'
        if not re.match(pattern, phone):
            raise ValidationException(f"Invalid phone format: {phone}")

    def can_update_role(self, current_user: UserEntity) -> bool:
        """
        Check if current user can update the role of target user.
        Only admins can change roles.
        """
        return current_user.is_admin()


class OTPService:
    """
    Service for OTP generation and verification.
    """

    OTP_EXPIRY_MINUTES = 10

    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP code."""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def send_otp_email(email: str, otp_code: str, user_name: str = "", is_password_reset: bool = False) -> None:
        """
        Send OTP code via email asynchronously using Celery.

        Args:
            email: Recipient email address
            otp_code: 6-digit OTP code
            user_name: User's name for email personalization
            is_password_reset: True if this is for password reset, False for registration
        """
        from ..tasks import send_otp_email_task

        # Queue the email sending task asynchronously
        send_otp_email_task.delay(
            email=email,
            otp_code=otp_code,
            user_name=user_name or 'Utilisateur',
            is_password_reset=is_password_reset
        )

    @staticmethod
    def is_otp_valid(otp_created_at) -> bool:
        """Check if OTP is still valid (not expired)."""
        if not otp_created_at:
            return False

        from django.utils import timezone
        expiry_time = otp_created_at + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
        return timezone.now() < expiry_time


class DeliveryPersonService:
    """
    Domain service for delivery person business logic.
    """

    def __init__(
        self,
        delivery_repository: IDeliveryPersonRepository,
        user_repository: IUserRepository
    ):
        self.delivery_repository = delivery_repository
        self.user_repository = user_repository

    def validate_delivery_person_creation(self, user_id: int) -> None:
        """
        Validate if a delivery person can be created.
        """
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", str(user_id))

        if not user.is_delivery_person():
            raise ValidationException("User must have DELIVERY role")

        existing = self.delivery_repository.get_by_user_id(user_id)
        if existing:
            raise AlreadyExistsException("DeliveryPerson", f"user_id {user_id}")

    def find_best_delivery_person(
        self,
        pickup_lat: float,
        pickup_lon: float
    ) -> Optional[DeliveryPersonEntity]:
        """
        Find the best available delivery person for a pickup location.
        Currently uses nearest delivery person, but can be extended with more logic.
        """
        available_persons = self.delivery_repository.find_nearest(
            pickup_lat,
            pickup_lon,
            limit=5
        )

        if not available_persons:
            return None

        # For now, return the nearest one
        # Can be extended to consider: rating, number of active deliveries, etc.
        return available_persons[0]

