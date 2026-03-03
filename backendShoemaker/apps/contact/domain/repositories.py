
from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import ContactEntity

class IContactRepository(ABC):
	@abstractmethod
	def create(self, contact: ContactEntity) -> ContactEntity:
		pass

	@abstractmethod
	def get_by_id(self, contact_id: int) -> Optional[ContactEntity]:
		pass

	@abstractmethod
	def list(self) -> List[ContactEntity]:
		pass

	@abstractmethod
	def delete(self, contact_id: int) -> None:
		pass
