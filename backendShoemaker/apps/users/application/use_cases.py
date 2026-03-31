"""
Use cases for the Users application.
Use cases orchestrate domain services and repositories to implement application features.
"""
from typing import Optional
from core.exceptions import ValidationException, NotFoundException, UnauthorizedException
from ..domain.entities import UserEntity
from ..domain.repositories import IUserRepository
from ..domain.services import UserService
from .dtos import CreateUserDTO, UpdateUserDTO, UserDTO
from .validators import UserValidator


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
