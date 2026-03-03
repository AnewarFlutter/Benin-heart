"""
Repository interfaces for the Users domain.
These are abstract base classes that define the contract for data access.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from .entities import UserEntity, DeliveryPersonEntity


class IUserRepository(ABC):
   
    """
        Interface du repository User et DeliveryPerson.
        
        POURQUOI UNE INTERFACE ?
        - Le domain ne doit PAS savoir qu'on utilise Django, PostgreSQL, etc.
        - On peut changer l'implémentation sans toucher au domain
        - On peut facilement mocker pour les tests
        
        Principe d'inversion de dépendance :
        - Le domain définit l'interface (ce dont il a besoin) ***Tres important***
        - L'infrastructure implémente l'interface (la façon dont on accède aux données)
        - Le domain dépend de l'abstraction, pas des détails
    """

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Get user by ID."""
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Get user by email."""
        pass

    @abstractmethod
    def create(self, user_entity: UserEntity, password: str) -> UserEntity: # le user entity ne contient pas le mot de passe c'est pour ça qu'on le passe en paramètre
        """Create a new user."""
        pass

    @abstractmethod
    def update(self, user_entity: UserEntity) -> UserEntity:
        """Update an existing user."""
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        """Delete a user."""
        pass

    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 100) -> List[UserEntity]:
        """List all users with pagination."""
        pass

    @abstractmethod
    def exists_by_email(self, email: str) -> bool:
            """Check if user exists by email."""
            pass


class IDeliveryPersonRepository(ABC):
    """
    Interface for DeliveryPerson repository.
    """

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[DeliveryPersonEntity]:
        """Get delivery person by user ID."""
        pass

    @abstractmethod
    def create(self, delivery_person: DeliveryPersonEntity) -> DeliveryPersonEntity:
        """Create a new delivery person."""
        pass

    @abstractmethod
    def update(self, delivery_person: DeliveryPersonEntity) -> DeliveryPersonEntity:
        """Update delivery person information."""
        pass

    @abstractmethod
    def list_available(self) -> List[DeliveryPersonEntity]:
        """List all available delivery persons."""
        pass

    @abstractmethod
    def find_nearest(self, lat: float, lon: float, limit: int = 5) -> List[DeliveryPersonEntity]:
        """Find nearest delivery persons to given location."""
        pass

 #Les Repository Interfaces (Abstractions)
#Définition : les interfaces définissent COMMENT on accède aux données, SANS spécifier l'implémentation.
