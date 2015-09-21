# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0002_script_help'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='exeName',
            field=models.CharField(default='kmers', max_length=30),
            preserve_default=False,
        ),
    ]
