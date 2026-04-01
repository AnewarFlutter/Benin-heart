def validate_question(question: str) -> None:
	if not question or not question.strip():
		raise ValueError("La question ne peut pas être vide.")
	if len(question) < 10:
		raise ValueError("La question doit contenir au moins 10 caractères.")

def validate_answer(answer: str) -> None:
	if not answer or not answer.strip():
		raise ValueError("La réponse ne peut pas être vide.")
	if len(answer) < 15:
		raise ValueError("La réponse doit contenir au moins 15 caractères.")
