"""
Repository implementations for Users domain.
These implement the repository interfaces defined in the domain layer.
"""
from typing import Optional, List
from django.contrib.auth.hashers import make_password
from django.db.models import F
from ..domain.entities import UserEntity
from ..domain.repositories import IUserRepository
from ..models import User


class DjangoUserRepository(IUserRepository):
    """
    Django ORM implementation of IUserRepository.
    """

    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Get user by ID."""
        try:
            user = User.objects.get(id=user_id)
            return self._model_to_entity(user)
        except User.DoesNotExist:
            return None

    def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Get user by email."""
        try:
            user = User.objects.get(email=email)
            return self._model_to_entity(user)
        except User.DoesNotExist:
            return None

    def create(self, user_entity: UserEntity, password: str) -> UserEntity:
        """Create a new user."""
        user = User.objects.create(
            email=user_entity.email,
            username=user_entity.email,  # Use email as username
            password=make_password(password),
            first_name=user_entity.first_name,
            last_name=user_entity.last_name,
            phone=user_entity.phone,
            role=user_entity.role,
            is_active=user_entity.is_active
        )
        return self._model_to_entity(user)

    def update(self, user_entity: UserEntity) -> UserEntity:
        """Update an existing user."""
        user = User.objects.get(id=user_entity.id)
        user.first_name = user_entity.first_name
        user.last_name = user_entity.last_name
        user.phone = user_entity.phone
        user.role = user_entity.role
        user.is_active = user_entity.is_active
        user.save()
        return self._model_to_entity(user)

    def delete(self, user_id: int) -> bool:
        """Delete a user."""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False

    def list_all(self, skip: int = 0, limit: int = 100) -> List[UserEntity]:
        """List all users with pagination."""
        users = User.objects.all()[skip:skip + limit]
        return [self._model_to_entity(user) for user in users]

    def exists_by_email(self, email: str) -> bool:
        """Check if user exists by email."""
        return User.objects.filter(email=email).exists()

    @staticmethod
    def _model_to_entity(user: User) -> UserEntity:
        """Convert Django model to domain entity."""
        return UserEntity(  
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )


