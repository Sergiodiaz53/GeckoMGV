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
    parameter1 = forms.ChoiceField(label="Filename", widget=forms.Select(attrs={'class':'selector','id': 'Filename'}))
    parameter2 = forms.CharField(label='K', max_length=1, widget=forms.TextInput(attrs={'id': 'K'}))
    parameter3 = forms.CharField(label='fullOut', max_length=1, widget=forms.NumberInput(attrs={'id': 'fullOut'}))


    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(kmersForm, self).__init__(*args, **kwargs)
        print self.user
        print userFile.objects.filter(user=self.user)
        self.fields['parameter1'] = forms.ChoiceField(choices=[(file.file.name, file.file.name) for file in userFile.objects.filter(user=self.user)], label="Filename", widget=forms.Select(attrs={'class':'selector','id': 'Filename'}))

class csb2csvForm(forms.Form):
    parameter1 = forms.ChoiceField(label="CSB file", widget=forms.Select(attrs={'class':'selector','id': 'CSBfile'}))
    parameter2 = forms.ChoiceField(label="Master file", widget=forms.Select(attrs={'class':'selector','id': 'Masterfile'}))


    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(csb2csvForm, self).__init__(*args, **kwargs)
        print self.user
        print userFile.objects.filter(user=self.user)
        self.fields['parameter1'] = forms.ChoiceField(choices=[(file.file.name, file.file.name) for file in userFile.objects.filter(user=self.user)], label="CSB file", widget=forms.Select(attrs={'class':'selector','id': 'CSBfile'}))
        self.fields['parameter2'] = forms.ChoiceField(choices=[(file.file.name, file.file.name) for file in userFile.objects.filter(user=self.user)], label="Master file", widget=forms.Select(attrs={'class':'selector','id': 'Masterfile'}))

