from django.conf.urls import patterns, include, url
from django.contrib import admin
import forms_builder.forms.urls


urlpatterns = patterns(
    '',
    url(r'^',include('MGV.urls') ),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^forms/', include(forms_builder.forms.urls)),
    url(r'^auth/', include('customAuth.urls')),
    url(r'^scripts/', include('scripts.urls')),
    url(r'^filemanager/', include('fileSystem.urls')),
)
