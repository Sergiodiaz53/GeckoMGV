from django.contrib import admin
from fileSystem.models import *

# Register your models here.


class FileAdmin(admin.ModelAdmin):
    list_display = (u'user','filename', 'file')
admin.site.register(userFile, FileAdmin)