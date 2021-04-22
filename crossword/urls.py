from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('latest', views.getLatestPuzzle, name='latest'),
    path('puzzle/<str:pk>', views.renderPuzzle, name="puzzle"),
    path('subscribe', views.sendMail, name="subscribe"),
    path('saveprogress', views.saveProgess, name="saveprogress")
]
