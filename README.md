# GeckoMGV
Multigenome viewer in Django and JS - University of Málaga

## Installation

To run GeckoMGV on your computer you should install first some dependencies, starting with python and virtualenv, so:

1. `apt-get install python virtualenv`
2. `git clone https://github.com/Sergiodiaz53/GeckoMGV`

Then, I recommend to create a virtualenv for this project:
3. `virutalenv GeckoMGV `

And activate it:
4. 'cd GeckoMGV/'
5. source bin/activate

Now we should be working inside our virtualenv, so we are going to install django and its plugins
6. pip install django==179 django-forms-builder django_extensions

We are going to set Django up:
7. `python manage.py migrate`
8. `python manage.py createsuperuser`

Finally, we should be able to run GeckoMGV with:
9. `python manage.py runserver`
... You can modify the ip address and the port using `python manage.py runserver 0.0.0.0:8000`
... Installing Werkzeug (`pip install Werkzeug`) you can use `python manage.py runserver_plus` for debug details

For extra documentation about how to register a service or, user guide for GeckoMGV, modules description... you can visit our server [PISTACHO](https://pistacho.ac.uma.es)
