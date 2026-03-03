from ..domain.entities import FaqEntity
from ..domain.repositories import FaqRepositoryInterface
from .validators import validate_question, validate_answer

def create_faq_use_case(question: str, answer: str, repository: FaqRepositoryInterface) -> FaqEntity:
    """
    Use case pour créer une FAQ après validation.
    """
    validate_question(question)
    validate_answer(answer)

    faq = FaqEntity(id=None, question=question, answer=answer)
    
    created_faq = repository.create_faq(faq)
    return created_faq
