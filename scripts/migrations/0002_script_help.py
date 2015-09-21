# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='help',
            field=models.CharField(default='help', max_length=400),
            preserve_default=False,
        ),
    ]
