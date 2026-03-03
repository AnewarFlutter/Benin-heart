"""
Main URL Configuration for Shoemaker project.
"""
from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from apps.users.presentation.users.views import CustomTokenObtainPairView


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation (Swagger/OpenAPI) - Réservé aux admins
    path('api/schema/', staff_member_required(SpectacularAPIView.as_view()), name='schema'),
    path('api/docs/', staff_member_required(SpectacularSwaggerView.as_view(url_name='schema')), name='swagger-ui'),
    path('api/redoc/', staff_member_required(SpectacularRedocView.as_view(url_name='schema')), name='redoc'),

    # API Authentication
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API endpoints
    path('api/', include('apps.users.presentation.users.urls')),  # Client & Delivery
    path('api/', include('apps.users.presentation.admin.urls')),  # Admin
    path('api/', include('apps.service.presentation.admin.urls')),  # Admin Service
    path('api/', include('apps.service.presentation.services.urls')),  # Client Service (Public)
    path('api/', include('apps.commande.presentation.admin.urls')),  # Admin Commandes
    path('api/', include('apps.commande.presentation.commandes.urls')),  # Client Commandes
    path('api/', include('apps.commande.presentation.codepromo.urls')),  # Client Codes Promo
    path('api/', include('apps.commande.presentation.delivery.urls')),  # Delivery Commandes
    path('api/delivery/', include('apps.users.presentation.delivery.urls')),  # Delivery Profile
    path('api/client/', include('apps.users.presentation.client.urls')),  # Client Profile
    path('api/', include('apps.contact.presentation.admin.urls')),  # Admin Contact
    path('api/', include('apps.contact.presentation.client.urls')),  # Client Contact
    path('api/', include('apps.faq.presentation.admin.urls')),  # Admin FAQ
    path('api/', include('apps.faq.presentation.client.urls')),  # Client FAQ
    path('api/', include('apps.temoignage.presentation.admin.urls')),  # Admin Témoignage
    path('api/', include('apps.temoignage.presentation.client.urls')),  # Client Témoignage
    path('api/', include('apps.devis.presentation.admin.urls')),  # Admin Devis
    path('api/', include('apps.devis.presentation.client.urls')),  # Client Devis
    path('api/', include('apps.creneaux.presentation.admin.urls')),  # Admin Créneaux
    path('api/', include('apps.creneaux.presentation.creneauxs.urls')),  # Client Créneaux
    path('api/', include('apps.storepage.presentation.storepages.urls')),  # Public Storepage (Hero Banners)
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
