import os
from django.db import models
from django.conf import settings


def generate_path(self, filename):
    url = "media/files/users/%s/%s" % (self.user.username, filename)
    return url

# Create your models here.

class userFile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='User_of_file')
    file = models.FileField(upload_to=generate_path)

    def filename(self):
        return os.path.basename(self.file.name)

