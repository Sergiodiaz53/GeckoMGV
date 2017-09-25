from django.conf.urls import patterns, url
from scripts import views

urlpatterns = patterns(
    '',
        url(r'^store$', views.storeService, name='storeService'),
        url(r'^executeService$', views.executeService, name='executeService'),
        url(r'^executeServiceInBackground$', views.executeServiceInBackground, name='executeServiceInBackground'),
        url(r'^listServices/$', views.listServices, name='listServices'),
        url(r'^ServiceInterface/$', views.serviceInterface, name='serviceInterface'),
        url(r'^testForm/$', views.testForm, name='testForm'),
        url(r'^getServiceList/$', views.getServiceList, name='getServiceList'),
        url(r'^getServiceForm/$', views.getServiceForm, name='getServiceForm'),
        url(r'^executeInternalService$', views.executeInternalService, name='executeInternalService'),
)
