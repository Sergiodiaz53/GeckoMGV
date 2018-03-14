from django.conf.urls import patterns, url
from django.conf import settings
from django.conf.urls.static import static
from fileSystem import views


urlpatterns = patterns(
    '',
        url(r'^$', views.fileManager_view, name='fileManager_view'),
        url(r'^uploadFile$', views.uploadFile_view, name='uploadFile_view'),
        url(r'^deleteFile$', views.deleteFile_view, name='deleteFile_view'),
        url(r'^createFile$', views.createFile_view, name='createFile_view'),
        url(r'^downloadFile$', views.downloadFile_view, name='downloadFile_view'),
        url(r'^viewFile$', views.fileViewer_view, name='fileViewer_view'),
        url(r'^createPost/$', views.createFilePost_view, name='createFilePost_view'),
        url(r'^console$',views.consoleViewer_view, name='consoleViewer_view')
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)