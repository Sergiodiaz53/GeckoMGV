"""
WSGI config for GeckoMGV project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/howto/deployment/wsgi/
"""

import os
import sys
import site
site.addsitedir('/work/geckomgv/GeckoMGV/geckomgvenv/lib/python2.7/site-packages')
path = '/work/geckomgv/GeckoMGV/'
sys.path.append(path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GeckoMGV.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
