from django import forms
from django.contrib.auth import get_user_model
from scripts.models import *
from fileSystem.views import *

User = get_user_model()

class RegisterService(forms.ModelForm):
    class Meta:
        fields = ["name", "exeName", "path", "help", "form"]
        model = Script

class ExecuteService(forms.Form):
    class Meta:
        fields = ["name", "args"]

class kmersForm(forms.Form):
    filename = forms.ChoiceField(label="Filename", widget=forms.Select(attrs={'class':'selector'}))
    K = forms.CharField(label='K', max_length=1)
    fullOut = forms.CharField(label='fullOut', max_length=1)

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(kmersForm, self).__init__(*args, **kwargs)
        print self.user
        print userFile.objects.filter(user=self.user)
        self.fields['filename'] = forms.ChoiceField(choices=[(file.file.name, file.file.name)
                                                             for file in userFile.objects.filter(user=self.user)])
