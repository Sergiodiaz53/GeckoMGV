# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0005_auto_20150708_1240'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='returnType',
            field=models.CharField(default=b'Frags', max_length=10, choices=[(b'Frags', b'Frags'), (b'Matrix', b'Matrix'), (b'External', b'External'), (b'Other', b'Other')]),
            preserve_default=True,
        ),
    ]
