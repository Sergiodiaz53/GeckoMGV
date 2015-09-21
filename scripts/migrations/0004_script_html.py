# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0003_script_exename'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='html',
            field=models.CharField(default='.html', max_length=50),
            preserve_default=False,
        ),
    ]
