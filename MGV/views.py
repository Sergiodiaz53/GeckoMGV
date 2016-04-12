from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from customAuth.views import *
from scripts.views import *
from fileSystem.forms import *
from fileSystem.views import *
from scripts.workers.EBI import EBI
from scripts.workers.services import clustalomega as co
from scripts.forms import drawMSAComp
from django.views.decorators.csrf import ensure_csrf_cookie
from django.template import RequestContext

from django.http import JsonResponse
import json

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

@csrf_exempt
def uploadFrags(request):
    if request.method == 'POST':
        createFile(request,request.POST['content'],request.POST['name'])
        return HttpResponse(status=201)
    else:
        return HttpResponse(status=501)

@csrf_exempt
def loadFileFromServer(request):
    file = userFile.objects.get(user = request.user, filename=request.GET.get('filename'))
    content = openFile(request.user,file)
    return HttpResponse(content, content_type="text/plain")


@csrf_exempt
def getFileList(request):
    fileNames = []
    for file in listUserFiles(request):
        if file.filename[-3:] == 'csv':
            fileNames.append(file.filename)
    response = JsonResponse(fileNames, safe=False)
    return HttpResponse(response, content_type="application/json")

def executeService_view(request):
    output = executeService(request)
    return render(request, 'serviceResult.html', {'output': output})

def contact_view(request):
    return render(request, 'contact.html')

def clustal_omega(request):
            content=co.clustal_omega(request)
            print(content)
            return render(request, 'MSAvisualizer.html', {'content': content})
    #if request.method=='POST':
    #    form = drawMSAComp(request.POST)
    #    if form.is_valid():
    #        seq1=form.cleaned_data['seq1']
    #        seq2=form.cleaned_data['seq2']
    #        content=co.clustal_omega(request,seq1,seq2)
    #        print(content)
    #        return render(request, 'MSAvisualizer.html', {'content': content})
    #else:
    #    form=drawMSAComp()
    #    return render(request, 'MSAvisualizer.html', {'form': form})
