from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('puzzle/<str:pk>', views.renderPuzzle, name="puzzle"),
    path('saveprogress', views.saveProgess, name="saveprogress")
]
