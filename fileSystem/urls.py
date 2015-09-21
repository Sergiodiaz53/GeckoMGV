from django.conf.urls import patterns, url
from fileSystem import views


urlpatterns = patterns(
    '',
        url(r'^$', views.fileManager_view, name='fileManager_view'),
        url(r'^uploadFile$', views.uploadFile_view, name='uploadFile_view'),
        url(r'^deleteFile$', views.deleteFile_view, name='deleteFile_view'),
)
