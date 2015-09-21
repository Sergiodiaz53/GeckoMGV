from django.conf.urls import patterns, url
from customAuth import views

urlpatterns = patterns(
    '',
        url(r'^login/$', views.authLogin, name='authLogin'),
        url(r'^logout/$', views.authLogout, name='authLogout')
)
