from django import forms
from .models import models
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

class drawMSAComp(forms.Form):
    seq1=forms.CharField(label='Sequence2', max_length=100)
    seq2=forms.CharField(label='Sequence1', max_length=100)


class kmersForm(forms.Form):
    parameter1 = forms.ChoiceField(label="Filename", widget=forms.Select(attrs={'class':'selector','id': 'Filename'}))
    parameter2 = forms.CharField(label='K', max_length=1, widget=forms.TextInput(attrs={'id': 'K'}))
    parameter3 = forms.CharField(label='fullOut', max_length=1, widget=forms.NumberInput(attrs={'id': 'fullOut'}))


    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(kmersForm, self).__init__(*args, **kwargs)
        self.fields['parameter1'] = forms.ChoiceField(choices=[(file.file.name, file.filename)  for file in userFile.objects.filter(user=self.user)], label="Filename", widget=forms.Select(attrs={'class':'selector','id': 'Filename'}))

class csb2csvForm(forms.Form):
    parameter1 = forms.ChoiceField(label="CSB file", widget=forms.Select(attrs={'class':'selector','id': 'CSBfile'}))
    parameter2 = forms.ChoiceField(label="Master file", widget=forms.Select(attrs={'class':'selector','id': 'Masterfile'}))


    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(csb2csvForm, self).__init__(*args, **kwargs)
        self.fields['parameter1'] = forms.ChoiceField(choices=[(file.file.name, file.filename)  for file in userFile.objects.filter(user=self.user)], label="CSB file", widget=forms.Select(attrs={'class':'selector','id': 'CSBfile'}))
        self.fields['parameter2'] = forms.ChoiceField(choices=[(file.file.name, file.filename)  for file in userFile.objects.filter(user=self.user)], label="Master file", widget=forms.Select(attrs={'class':'selector','id': 'Masterfile'}))

class extractSeqFromFragsForm(forms.Form):
    parameter1 = forms.ChoiceField(label="frags file", widget=forms.Select(attrs={'class':'selector','id': 'fragsFile'}))
    parameter2 = forms.ChoiceField(label="X Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'xFastaFile'}))
    parameter3 = forms.ChoiceField(label="Y Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'yFastaFile'}))
    parameter4 = forms.ChoiceField(label="Y-reversed Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'yReversedFastaFile'}))
    parameter5 = forms.ChoiceField(label="Output FragFile", widget=forms.Select(attrs={'class':'selector','id': 'outputFragFile'}))
    parameter6 = forms.CharField(label='Block', max_length=4, widget=forms.TextInput(attrs={'id': 'block'}))

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.request = kwargs.pop('request', None)
        super(extractSeqFromFragsForm, self).__init__(*args, **kwargs)
        self.fields['parameter1'] = forms.ChoiceField(choices=[(file.file.name, file.filename) for file in userFile.objects.filter(user=self.user)], label="frags file", widget=forms.Select(attrs={'class':'selector','id': 'fragsFile'}))
        self.fields['parameter2'] = forms.ChoiceField(choices=[(file.file.name, file.filename) for file in userFile.objects.filter(user=self.user)], label="X Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'xFastaFile'}))
        self.fields['parameter3'] = forms.ChoiceField(choices=[(file.file.name, file.filename) for file in userFile.objects.filter(user=self.user)], label="Y Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'yFastaFile'}))
        self.fields['parameter4'] = forms.ChoiceField(choices=[(file.file.name, file.filename) for file in userFile.objects.filter(user=self.user)], label="Y-reversed Fasta file", widget=forms.Select(attrs={'class':'selector','id': 'yReversedFastaFile'}))
        self.fields['parameter5'] = forms.ChoiceField(choices=[(file.file.name, file.filename) for file in userFile.objects.filter(user=self.user)], label="Output FragFile", widget=forms.Select(attrs={'class':'selector','id': 'outputFragFile'}))
