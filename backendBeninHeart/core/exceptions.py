"""
Custom exceptions for business logic.
These exceptions are used in the domain layer.
"""


class DomainException(Exception):
    """Base exception for all domain-related errors."""
    def __init__(self, message: str = "A domain error occurred"):
        self.message = message
        super().__init__(self.message)


class NotFoundException(DomainException):
    """Exception raised when a resource is not found."""
    def __init__(self, resource: str, identifier: str = None):
        message = f"{resource} not found"
        if identifier:
            message += f" with identifier: {identifier}"
        super().__init__(message)


class ValidationException(DomainException):
    """Exception raised when validation fails."""
    def __init__(self, message: str = "Validation error"):
        super().__init__(message)


class AlreadyExistsException(DomainException):
    """Exception raised when trying to create a resource that already exists."""
    def __init__(self, resource: str, field: str = None):
        message = f"{resource} already exists"
        if field:
            message += f" with {field}"
        super().__init__(message)


class UnauthorizedException(DomainException):
    """Exception raised when user is not authorized."""
    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(message)


class BusinessRuleException(DomainException):
    """Exception raised when a business rule is violated."""
    def __init__(self, message: str):
        super().__init__(message)
