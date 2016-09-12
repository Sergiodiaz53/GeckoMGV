from django.db import models

# Create your models here.

class Script (models.Model):
    name = models.CharField(max_length=30, null=False)
    exeName = models.CharField(max_length=30, null=False)
    path = models.CharField(max_length=50, null=False)
    help = models.CharField(max_length=400, null=False)
    form = models.CharField(max_length=50, null=False)
    choices=(("Frags","Frags"),("Matrix","Matrix"),("External","External"),("Other","Other"))
    returnType = models.CharField(max_length=10,choices=choices, null=False, default="Frags")

    def __str__(self):
        return str(self.pk)