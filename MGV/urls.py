from django.conf.urls import patterns, url
from MGV import views

urlpatterns = patterns(
    '',
        url(r'^$', views.index, name='index'),
        url(r'^services', views.services_view, name='services_view'),
        url(r'^execute', views.executeService_view, name='executeService_view'),
        url(r'^login', views.login_view, name='login_view'),
        url(r'^logout', views.logout_view, name='logout_view'),
        url(r'^test',views.clustal_omega,name='clustal_omega'),
)
