"""
Use cases for the Users application.
Use cases orchestrate domain services and repositories to implement application features.
"""
from typing import Optional
from core.exceptions import ValidationException, NotFoundException, UnauthorizedException
from ..domain.entities import UserEntity, DeliveryPersonEntity
from ..domain.repositories import IUserRepository, IDeliveryPersonRepository
from ..domain.services import UserService, DeliveryPersonService
from .dtos import (
    CreateUserDTO, UpdateUserDTO, UserDTO,
    CreateDeliveryPersonDTO, UpdateDeliveryPersonDTO, DeliveryPersonDTO,
    UpdateLocationDTO
)
from .validators import UserValidator, DeliveryPersonValidator

class UserMapper:

    @staticmethod
    def entity_to_dto(entity: UserEntity) -> UserDTO:
        return UserDTO(
            id=entity.id,
            email=entity.email,
            first_name=entity.first_name,
            last_name=entity.last_name,
            phone=entity.phone,
            role=entity.role,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )

class DeliveryPersonMapper:

    @staticmethod
    def entity_to_dto(entity: DeliveryPersonEntity) -> DeliveryPersonDTO:
        user_dto = UserMapper.entity_to_dto(entity.user)

        return DeliveryPersonDTO(
            user=user_dto,
            vehicle_type=entity.vehicle_type,
            license_number=entity.license_number,
            is_available=entity.is_available,
            current_location_lat=entity.current_location_lat,
            current_location_lon=entity.current_location_lon
        )


class RegisterUserUseCase:
    """Use case for registering a new user."""

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository
        self.user_service = UserService(user_repository)

    def execute(self, dto: CreateUserDTO) -> UserDTO:
        """Register a new user."""
        # Validate input
        UserValidator.validate_email(dto.email)
        UserValidator.validate_password(dto.password)
        UserValidator.validate_name(dto.first_name, "First name")
        UserValidator.validate_name(dto.last_name, "Last name")
        UserValidator.validate_phone(dto.phone)
        UserValidator.validate_role(dto.role)

        # Check business rules
        self.user_service.validate_user_creation(dto.email)

        # Create entity
        user_entity = UserEntity(
            id=None,
            email=dto.email,
            first_name=dto.first_name,
            last_name=dto.last_name,
            phone=dto.phone,
            role=dto.role,
            is_active=True
        )

        # Persist
        created_user = self.user_repository.create(user_entity, dto.password)

        # Return DTO
        return UserMapper._entity_to_dto(created_user)

   
class UpdateUserProfileUseCase:
    """Use case for updating user profile."""

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    def execute(self, user_id: int, dto: UpdateUserDTO) -> UserDTO:
        """Update user profile."""
        # Get existing user
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", str(user_id))

        # Validate input
        if dto.first_name:
            UserValidator.validate_name(dto.first_name, "First name")
            user.first_name = dto.first_name

        if dto.last_name:
            UserValidator.validate_name(dto.last_name, "Last name")
            user.last_name = dto.last_name

        if dto.phone is not None:
            UserValidator.validate_phone(dto.phone)
            user.phone = dto.phone

        # Update
        updated_user = self.user_repository.update(user)

        return UserMapper._entity_to_dto(updated_user)

   
class GetUserByIdUseCase:
    """Use case for retrieving a user by ID."""

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    def execute(self, user_id: int) -> UserDTO:
        """Get user by ID."""
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", str(user_id))

        return self.UserMapper._entity_to_dto(user)

   
class CreateDeliveryPersonUseCase:
    """Use case for creating a delivery person profile."""

    def __init__(
        self,
        delivery_repository: IDeliveryPersonRepository,
        user_repository: IUserRepository
    ):
        self.delivery_repository = delivery_repository
        self.user_repository = user_repository
        self.delivery_service = DeliveryPersonService(delivery_repository, user_repository)

    def execute(self, dto: CreateDeliveryPersonDTO) -> DeliveryPersonDTO:
        """Create delivery person profile."""
        # Validate
        DeliveryPersonValidator.validate_vehicle_type(dto.vehicle_type)
        DeliveryPersonValidator.validate_license_number(dto.license_number)

        # Check business rules
        self.delivery_service.validate_delivery_person_creation(dto.user_id)

        # Get user
        user = self.user_repository.get_by_id(dto.user_id)

        # Create entity
        delivery_person = DeliveryPersonEntity(
            user=user,
            vehicle_type=dto.vehicle_type,
            license_number=dto.license_number,
            is_available=True
        )

        # Persist
        created = self.delivery_repository.create(delivery_person)

        return DeliveryPersonMapper._entity_to_dto(created)


class UpdateDeliveryPersonLocationUseCase:
    """Use case for updating delivery person location."""

    def __init__(self, delivery_repository: IDeliveryPersonRepository):
        self.delivery_repository = delivery_repository

    def execute(self, user_id: int, dto: UpdateLocationDTO) -> DeliveryPersonDTO:
        """Update delivery person location."""
        # Validate
        DeliveryPersonValidator.validate_location(dto.latitude, dto.longitude)

        # Get delivery person
        delivery_person = self.delivery_repository.get_by_user_id(user_id)
        if not delivery_person:
            raise NotFoundException("DeliveryPerson", f"user_id {user_id}")

        # Update location
        delivery_person.update_location(dto.latitude, dto.longitude)

        # Persist
        updated = self.delivery_repository.update(delivery_person)

        return DeliveryPersonMapper._entity_to_dto(updated)

