from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import FaqEntity



class FaqRepositoryInterface(ABC):
    @abstractmethod
    def create_faq(self,faq:FaqEntity)->FaqEntity:
        pass
    @abstractmethod
    def get_faq_by_id(self,faq_id:int)->Optional[FaqEntity]:
        pass
    @abstractmethod
    def update_faq(self,faq:FaqEntity)->FaqEntity:
        pass
    @abstractmethod
    def delete_faq(self,faq_id:int)->None:
        pass