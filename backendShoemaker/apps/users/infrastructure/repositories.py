"""
Repository implementations for Users domain.
These implement the repository interfaces defined in the domain layer.
"""
from typing import Optional, List
from django.contrib.auth.hashers import make_password
from django.db.models import F
from ..domain.entities import UserEntity, DeliveryPersonEntity
from ..domain.repositories import IUserRepository, IDeliveryPersonRepository
from ..models import User, DeliveryPerson


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


class DjangoDeliveryPersonRepository(IDeliveryPersonRepository):
    """
    Django ORM implementation of IDeliveryPersonRepository.
    """

    def get_by_user_id(self, user_id: int) -> Optional[DeliveryPersonEntity]:
        """Get delivery person by user ID."""
        try:
            delivery_person = DeliveryPerson.objects.select_related('user').get(user_id=user_id)
            return self._model_to_entity(delivery_person)
        except DeliveryPerson.DoesNotExist:
            return None

    def create(self, delivery_person: DeliveryPersonEntity) -> DeliveryPersonEntity:
        """Create a new delivery person."""
        dp = DeliveryPerson.objects.create(
            user_id=delivery_person.user.id,
            vehicle_type=delivery_person.vehicle_type,
            license_number=delivery_person.license_number,
            is_available=delivery_person.is_available,
            current_location_lat=delivery_person.current_location_lat,
            current_location_lon=delivery_person.current_location_lon
        )
        return self._model_to_entity(dp)

    def update(self, delivery_person: DeliveryPersonEntity) -> DeliveryPersonEntity:
        """Update delivery person information."""
        dp = DeliveryPerson.objects.get(user_id=delivery_person.user.id)
        dp.vehicle_type = delivery_person.vehicle_type or dp.vehicle_type
        dp.license_number = delivery_person.license_number or dp.license_number
        dp.is_available = delivery_person.is_available
        dp.current_location_lat = delivery_person.current_location_lat
        dp.current_location_lon = delivery_person.current_location_lon
        dp.save()
        return self._model_to_entity(dp)

    def list_available(self) -> List[DeliveryPersonEntity]:
        """List all available delivery persons."""
        delivery_persons = DeliveryPerson.objects.filter(
            is_available=True
        ).select_related('user')
        return [self._model_to_entity(dp) for dp in delivery_persons]

    def find_nearest(self, lat: float, lon: float, limit: int = 5) -> List[DeliveryPersonEntity]:
        """
        Find nearest delivery persons to given location.
        This is a simplified version. In production, use PostGIS or similar.
        """
        # Filter available delivery persons with location
        delivery_persons = DeliveryPerson.objects.filter(
            is_available=True,
            current_location_lat__isnull=False,
            current_location_lon__isnull=False
        ).select_related('user')

        # Calculate distance for each (simple approximation)
        # In production, use PostGIS distance calculations
        results = []
        for dp in delivery_persons:
            distance = self._calculate_distance(
                lat, lon,
                dp.current_location_lat, dp.current_location_lon
            )
            results.append((distance, dp))

        # Sort by distance and return top N
        results.sort(key=lambda x: x[0])
        return [self._model_to_entity(dp) for _, dp in results[:limit]]

    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula.
        Returns distance in kilometers.
        """
        from math import radians, sin, cos, sqrt, atan2

        R = 6371  # Earth's radius in km

        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))

        return R * c

    def _model_to_entity(self, dp: DeliveryPerson) -> DeliveryPersonEntity:
        """Convert Django model to domain entity."""
        user_entity = UserEntity( # ici on convertit le model user en entity user en utilisant les attributs du model dp.user car dp est une instance de DeliveryPerson qui a une relation avec User via dp.user
            id=dp.user.id,
            email=dp.user.email,
            first_name=dp.user.first_name,
            last_name=dp.user.last_name,
            phone=dp.user.phone,
            role=dp.user.role,
            is_active=dp.user.is_active,
            created_at=dp.user.created_at,
            updated_at=dp.user.updated_at
        )

        return DeliveryPersonEntity(
            user=user_entity,
            vehicle_type=dp.vehicle_type,
            license_number=dp.license_number,
            is_available=dp.is_available,
            current_location_lat=dp.current_location_lat,
            current_location_lon=dp.current_location_lon
        )
