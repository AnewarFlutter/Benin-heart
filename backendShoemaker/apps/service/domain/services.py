"""
Domain services for Service app
"""


class ServiceDomainService:
    """Service domain service."""

    @staticmethod
    def calculate_hours_from_days(days):
        """Calculate hours from days."""
        return days * 24
