"""
URL configuration for client profil endpoints.
"""
from django.urls import path
from .views import (
    MonProfilView,
    ProfilsListView,
    ProfilDetailView,
    UploadPhotoView,
    SupprimerPhotoView,
    UploadVideoView,
)

urlpatterns = [
    path('client/profils/', ProfilsListView.as_view(), name='client-profils-list'),
    path('client/profils/<uuid:uuid>/', ProfilDetailView.as_view(), name='client-profil-detail'),
    path('client/mon-profil/', MonProfilView.as_view(), name='client-mon-profil'),
    path('client/mon-profil/photos/', UploadPhotoView.as_view(), name='client-profil-photos'),
    path('client/mon-profil/photos/<uuid:uuid>/', SupprimerPhotoView.as_view(), name='client-profil-photo-delete'),
    path('client/mon-profil/video/', UploadVideoView.as_view(), name='client-profil-video'),
]
