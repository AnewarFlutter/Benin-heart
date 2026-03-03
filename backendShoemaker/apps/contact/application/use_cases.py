"""
Use cases for the Contact application layer.
"""
from ..domain.entities import ContactEntity
from ..domain.repositories import IContactRepository
from .dtos import ContactDTO, CreateContactDTO
from .validators import ContactValidator


class CreateContactUseCase:
    """Use case for submitting a new contact message."""

    def __init__(self, contact_repository: IContactRepository):
        self.contact_repository = contact_repository

    def execute(self, dto: CreateContactDTO) -> ContactDTO:
        ContactValidator.validate_name(dto.name)
        ContactValidator.validate_email(dto.email)
        ContactValidator.validate_subject(dto.sujet)
        ContactValidator.validate_message(dto.message)

        entity = ContactEntity(
            id=None,
            uuid=None,
            name=dto.name,
            email=dto.email,
            phone=dto.phone,
            sujet=dto.sujet,
            message=dto.message
        )

        created = self.contact_repository.create(entity)

        return self._entity_to_dto(created)

    @staticmethod
    def _entity_to_dto(entity: ContactEntity) -> ContactDTO:
        return ContactDTO(
            id=entity.id,
            uuid=entity.uuid,
            name=entity.name,
            email=entity.email,
            phone=entity.phone,
            sujet=entity.sujet,
            message=entity.message,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
