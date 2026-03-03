
from typing import List, Optional
from ..domain.entities import ContactEntity
from ..domain.repositories import IContactRepository
from ..models import Contact

class ContactRepository(IContactRepository):
	def create(self, contact: ContactEntity) -> ContactEntity:
		obj = Contact.objects.create(
			name=contact.name,
			email=contact.email,
			phone=contact.phone,
			sujet=contact.sujet,
			message=contact.message
		)
		return self._to_entity(obj)

	def get_by_id(self, contact_id: int) -> Optional[ContactEntity]:
		try:
			obj = Contact.objects.get(id=contact_id)
			return self._to_entity(obj)
		except Contact.DoesNotExist:
			return None

	def list(self) -> List[ContactEntity]:
		return [self._to_entity(obj) for obj in Contact.objects.all()]

	def delete(self, contact_id: int) -> None:
		Contact.objects.filter(id=contact_id).delete()

	def _to_entity(self, obj: Contact) -> ContactEntity:
		return ContactEntity(
			id=obj.id,
			uuid=obj.uuid,
			name=obj.name,
			email=obj.email,
			phone=obj.phone,
			sujet=obj.sujet,
			message=obj.message,
			created_at=obj.created_at,
			updated_at=obj.updated_at
		)
