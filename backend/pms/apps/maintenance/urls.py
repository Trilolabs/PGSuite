"""Maintenance app URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('properties/<uuid:property_pk>/complaints/',
         views.ComplaintViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='complaints'),
    path('properties/<uuid:property_pk>/complaints/<uuid:pk>/',
         views.ComplaintViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='complaint-detail'),
    path('properties/<uuid:property_pk>/complaints/<uuid:pk>/assign/',
         views.ComplaintViewSet.as_view({'post': 'assign'}),
         name='complaint-assign'),
    path('properties/<uuid:property_pk>/complaints/<uuid:pk>/resolve/',
         views.ComplaintViewSet.as_view({'post': 'resolve'}),
         name='complaint-resolve'),

    path('properties/<uuid:property_pk>/inspections/',
         views.InspectionViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='inspections'),
    path('properties/<uuid:property_pk>/inspections/<uuid:pk>/',
         views.InspectionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='inspection-detail'),

    path('properties/<uuid:property_pk>/reviews/',
         views.ReviewViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='reviews'),
    path('properties/<uuid:property_pk>/reviews/<uuid:pk>/',
         views.ReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='review-detail'),
    path('properties/<uuid:property_pk>/reviews/<uuid:pk>/respond/',
         views.ReviewViewSet.as_view({'post': 'respond'}),
         name='review-respond'),
    path('properties/<uuid:property_pk>/reviews/summary/',
         views.ReviewViewSet.as_view({'get': 'summary'}),
         name='review-summary'),

    # Task Templates
    path('properties/<uuid:property_pk>/task-templates/',
         views.TaskTemplateViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='task-templates'),
    path('properties/<uuid:property_pk>/task-templates/<uuid:pk>/',
         views.TaskTemplateViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='task-template-detail'),

    # Tasks
    path('properties/<uuid:property_pk>/tasks/',
         views.TaskViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='tasks'),
    path('properties/<uuid:property_pk>/tasks/stats/',
         views.TaskViewSet.as_view({'get': 'stats'}),
         name='task-stats'),
    path('properties/<uuid:property_pk>/tasks/<uuid:pk>/',
         views.TaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='task-detail'),
    path('properties/<uuid:property_pk>/tasks/<uuid:pk>/complete/',
         views.TaskViewSet.as_view({'post': 'complete'}),
         name='task-complete'),
]
