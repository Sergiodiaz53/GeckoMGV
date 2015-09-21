# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import fileSystem.models
from django.conf import settings


class Migration(migrations.Migration):

    replaces = [(b'fileSystem', '0001_initial'), (b'fileSystem', '0002_userfile_name'), (b'fileSystem', '0003_remove_userfile_name')]

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='userFile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('file', models.FileField(upload_to=fileSystem.models.generate_path)),
                ('user', models.ForeignKey(related_name='User_of_file', to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
