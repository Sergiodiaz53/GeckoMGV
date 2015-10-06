from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from scripts.forms import *
from fileSystem.views import *
from scripts import forms
import subprocess

# Create your views here.

def storeService(request):
    if request.method == 'POST':
        form = RegisterService(request.POST)
        if form.is_valid():
            script = form.save(commit=False)
            script.save()
    return HttpResponse("OK", content_type="text/plain")

def executeService(request):
    print request.POST
    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        auxForm= getattr(forms, service.form)
        form = auxForm(user = request.user, request = request)
        args = []

        for i in xrange(1,(len(form.fields))+1) :
            idParamater = 'parameter'+str(i)
            args.append(request.POST.get(idParamater))

        command = [service.path+request.POST.get('exeName')]
        command.extend(args)
        output = subprocess.Popen(command, stdout=subprocess.PIPE).communicate()[0]
        print output
        fileResult = createFile(request, output, 'test')
        print fileResult.file
    return render(request, 'serviceResult.html', {'serviceName': request.POST.get('serviceName'), 'fileResult': fileResult, 'filePath': fileResult.file})

def listServices(request):
    print "listServices_scripts"
    return Script.objects.all()

def serviceInterface(request):
    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        files = listUserFiles(request)
        myForm= getattr(forms, service.form)
        form = myForm(user = request.user, request = request)
        return render(request, 'serviceInterface.html', {'name': service.name, 'exeName': service.exeName, 'files': files, 'form': form})

def testForm(request):
    print request
    return HttpResponse("OK", content_type="text/plain")