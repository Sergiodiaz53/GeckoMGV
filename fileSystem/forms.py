from django import forms

class FileForm(forms.Form):
    userfile = forms.FileField(label='Select a file', widget=forms.ClearableFileInput(attrs={'multiple': True}))

class DeleteFileForm(forms.Form):
    class Meta:
        fields = ["filename"]