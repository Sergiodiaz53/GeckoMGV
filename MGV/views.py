from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from customAuth.views import *
from scripts.views import *
from fileSystem.forms import *
from fileSystem.views import *
from scripts.workers.EBI import EBI
from scripts.workers.services import clustalomega as co



# Create your views here.

def index (request):
    print request.user
    return render(request, 'index.html')


def login_view(request):
    print "login_view_MGV"
    if request.method == 'POST':
        username = authLogin(request)
        print username
        if username is not None:
            return render(request, 'index.html')
        else:
            return HttpResponse("ERROR", content_type="text/plain")
    else:
        return render(request, 'index.html')

def logout_view(request):
    print "logout_view_MGV"
    authLogout(request)
    return render(request, 'index.html')

def services_view(request):
    list = listServices(request)
    print list
    return render(request, 'services.html', {'services': list})

def executeService_view(request):
    output = executeService(request)
    return render(request, 'serviceResult.html', {'output': output})

def clustal_omega(request):
    content=co.clustal_omega(request)
    return render(request, 'MSAvisualizer.html', {'content': content})

