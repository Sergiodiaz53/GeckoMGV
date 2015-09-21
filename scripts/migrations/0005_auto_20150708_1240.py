# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0004_script_html'),
    ]

    operations = [
        migrations.RenameField(
            model_name='script',
            old_name='html',
            new_name='form',
        ),
    ]
