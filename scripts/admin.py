from django.contrib import admin
from scripts.models import *

# Register your models here.

class ServiceAdmin(admin.ModelAdmin):
    list_display = (u'name', 'exeName', 'path', 'help', 'form','returnType')
    list_filter = ('name',)
    search_fields = ('name',)
admin.site.register(Script, ServiceAdmin)