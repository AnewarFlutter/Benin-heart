from domain.entities import FaqEntity
from domain.repositories import FaqRepositoryInterface


class FaqService:

    def __init__(self, repository: FaqRepositoryInterface):
        self.repository = repository

    def create_faq(self, question: str, answer: str) -> FaqEntity:
        faq = FaqEntity(
            id=None,
            question=question,
            answer=answer
        )
        return self.repository.create_faq(faq)

    def update_faq(self, faq_id: int, question: str, answer: str) -> FaqEntity:
        faq = self.repository.get_faq_by_id(faq_id)
        if not faq:
            raise Exception("FAQ not found")

        faq.question = question
        faq.answer = answer
        return self.repository.update_faq(faq)

    def delete_faq(self, faq_id: int) -> None:
        self.repository.delete_faq(faq_id)
