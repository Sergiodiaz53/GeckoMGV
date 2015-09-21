from django import forms
from fileSystem.models import *

class FileForm(forms.Form):
    userfile = forms.FileField(label='Select a file')

class DeleteFileForm(forms.Form):
    class Meta:
        fields = ["filename"]