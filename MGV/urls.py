from django.conf.urls import patterns, url
from MGV import views

urlpatterns = patterns(
    '',
        url(r'^$', views.index, name='index'),
        url(r'^services', views.services_view, name='services_view'),
        url(r'^execute', views.executeService_view, name='executeService_view'),
        url(r'^login', views.login_view, name='login_view'),
        url(r'^logout', views.logout_view, name='logout_view'),
        url(r'^loadFileFromServer', views.loadFileFromServer, name='loadFileFromServer'),
        url(r'^getFileList', views.getFileList, name='getFileList'),
        url(r'^test',views.clustal_omega,name='clustal_omega'),
        url(r'^upload',views.uploadFrags, name= 'uploadFrags'),
        url(r'^contact',views.contact_view, name= 'contact_view'),
        url(r'^help',views.help_view, name= 'help_view'),
        url(r'^lrequired',views.loginrequired_view, name= 'loginrequired_view'),
        url(r'^removeRepetitions',views.removeRepetitions, name= 'removeRepetitions'),
)
