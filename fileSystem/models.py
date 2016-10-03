import os
from django.db import models
from django.conf import settings


def generatePath(self, filename):
    # url = "media/files/users/%s/%s" % (self.user.username, filename)
    url = os.path.join(settings.MEDIA_ROOT, "files/users/%s/%s" % (self.user.username, filename))
    print "Generated path: ", url
    return url

# Create your models here.

class userFile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='User_of_file')
    filename = models.CharField(max_length=50, null=False)
    file = models.FileField(upload_to=generatePath)


