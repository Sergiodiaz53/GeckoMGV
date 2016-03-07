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
        form = auxForm(user = request.user, request=request)
        args = []

        for i in xrange(1, (len(form.fields))+1):
            idParamater = 'parameter'+str(i)
            args.append(request.POST.get(idParamater))
            print "/**\n"
            print form
            print "\n**/"

        print os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))
        command = [os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))]
        command.extend(args)
        output = subprocess.Popen(command, stdout=subprocess.PIPE).communicate()[0]


        #Read console output line by line example
        """
        p = Popen(command, stdout=PIPE, bufsize=1)
        with p.stdout:
            for line in iter(p.stdout.readline, b''):
                print line,
        p.wait() # wait for the subprocess to exit

        """


        fileResult = createFile(request, output, request.POST.get('nameFileResult'))
        return render(request, 'serviceResult.html', {'serviceName': request.POST.get('serviceName'),
                                                      'fileResult': fileResult, 'filePath': fileResult.file})


def listServices(request):
    print "listServices_scripts"
    return Script.objects.all()


def serviceInterface(request):
    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        files = listUserFiles(request)
        auxform = getattr(forms, service.form)
        form = auxform(user = request.user, request = request)

        return render(request, 'serviceInterface.html', {'name': service.name, 'exeName': service.exeName,
                                                         'files': files, 'form': form})


def testForm(request):
    print request
    return HttpResponse("OK", content_type="text/plain")

@csrf_exempt
def getServiceList(request):
    serviceNames = []
    for service in listServices(request):
        serviceNames.append(service.name)
    response = JsonResponse(serviceNames, safe=False)
    return HttpResponse(response, content_type="application/json")

@csrf_exempt
def getServiceForm(request):
    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        files = listUserFiles(request)
        auxform = getattr(forms, service.form)
        form = auxform(user = request.user, request = request)
        print "/**\n"
        print getattr(forms, service.form)
        print "\n**/"
        return render(request, 'modalForm.html', {'name': service.name, 'exeName': service.exeName,
                                                         'files': files, 'form': form})