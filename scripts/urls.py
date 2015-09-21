from django.conf.urls import patterns, url
from scripts import views

urlpatterns = patterns(
    '',
        url(r'^store$', views.storeService, name='storeService'),
        url(r'^executeService$', views.executeService, name='executeService'),
        url(r'^listServices/$', views.listServices, name='listServices'),
        url(r'^ServiceInterface/$', views.serviceInterface, name='serviceInterface')
)
