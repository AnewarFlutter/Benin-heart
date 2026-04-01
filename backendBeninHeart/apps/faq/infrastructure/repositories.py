from typing import Optional, List
from domain.repositories import FaqRepositoryInterface
from domain.entities import FaqEntity
from ..models import FAQ


class DjangoFaqRepository(FaqRepositoryInterface):

    def create_faq(self, faq: FaqEntity) -> FaqEntity:
        faq_model = FAQ.objects.create(
            question=faq.question,
            answer=faq.answer
        )
        return self._model_to_entity(faq_model)

    def get_faq_by_id(self, faq_id: int) -> Optional[FaqEntity]:
        try:
            faq_model = FAQ.objects.get(id=faq_id)
            return self._model_to_entity(faq_model)
        except FAQ.DoesNotExist:
            return None

    def get_all_faqs(self) -> List[FaqEntity]:
        return [
            self._model_to_entity(faq_model)
            for faq_model in FAQ.objects.all()
        ]

    def update_faq(self, faq: FaqEntity) -> FaqEntity:
        faq_model = FAQ.objects.get(id=faq.id)
        faq_model.question = faq.question
        faq_model.answer = faq.answer
        faq_model.save()
        return self._model_to_entity(faq_model)

    def delete_faq(self, faq_id: int) -> None:
        FAQ.objects.filter(id=faq_id).delete()

    def _model_to_entity(self, model: FAQ) -> FaqEntity:
        return FaqEntity(
            id=model.id,
            question=model.question,
            answer=model.answer,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
