from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from scripts import forms
from scripts.workers.services import clustalomega as co
import subprocess
import threading
from django.core.mail import send_mail

from scripts import internalServices as intService

def storeService(request):
    if request.method == 'POST':
        form = RegisterService(request.POST)
        if form.is_valid():
            script = form.save(commit=False)
            script.save()
    return HttpResponse("OK", content_type="text/plain")

@login_required()
def executeService(request):
    print "REQUEST --- " + str(request.POST)
    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        auxForm = getattr(forms, service.form)
        form = auxForm(user = request.user, request=request)
        args = []

        for i in xrange(1, (len(form.fields))+1):
            idParamater = 'parameter'+str(i)
            args.append(request.POST.get(idParamater))

        form = FileForm()
        files = userFile.objects.filter(user = request.user)

        # Check Service PATH (Internal or External)
        if service.path == 'Internal':
            internal_service_name = request.POST.get('exeName')
            intService.executeInternalService(internal_service_name, args, request)
        else:
            print "PATH : " + os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))
            command = [os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))]
            command.extend(args)

            ThreadProcess = threading.Thread(target=runServiceInThread, args=(command, request))
            ThreadProcess.daemon = True
            ThreadProcess.start()

            #fileResult = createFile(request, output, request.POST.get('nameFileResult'))
        return render(request, 'filemanager.html', {'form': form, 'files': files})
        #return render(request, 'MSAvisualizer.html', {'content': content})

def runServiceInThread (command, request):
    print "###########"
    print "COMMAND: " + str(command)
    print "###########"
    output = subprocess.Popen(command, stdout=subprocess.PIPE, close_fds=True).communicate()[0]

    path = generatePath(request, 'log')

    if not os.path.isfile(path):
        print os.path.isfile(path)
        file = open(path, 'wb')
        file.write(output)
        file.close()
    else:
        print os.path.isfile(path)
        file = open(path, 'r+b')
        content = file.read()
        content += "\n\n-----------------------------------NEXT SERVICE-----------------------------------\n\n" + output
        file.write(content)
        file.close()

    """
    send_mail(
        'Subject here',
        'Here is the message.',
        'geckomgvsupport@gmail.com',
        ['sergiodiazdp@gmail.com'],
        fail_silently=False,
    )
    """


@csrf_exempt
def executeServiceInBackground(request):

    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        auxForm = getattr(forms, service.form)
        form = auxForm(user = request.user, request=request)
        args = []

        for i in xrange(1, (len(form.fields))+1):
            idParamater = 'parameter'+str(i)
            args.append(request.POST.get(idParamater))
            #print "/**\n"
            #print form
            #print "\n**/"

        # Check Service PATH (Internal or External)
        if service.path == 'Internal':
            print "OK"
            #internal_service_name = "intService."+request.POST.get('exeName')
            #intService.executeInternalService(eval(internal_service_name), args, request)
        else:
            print os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))
            command = [os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))]
            command.extend(args)

            ThreadProcess = threading.Thread(target=runServiceInThread, args=(command, request))
            ThreadProcess.daemon = True
            ThreadProcess.start()


        print args

        #createFile(request, output, request.POST.get('nameFileResult'))
        return HttpResponse("OK", content_type="text/plain")

def listServices(request):
    print "listServices_scripts"
    return Script.objects.all()


@login_required()
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
    serviceExes = []
    for service in listServices(request):
        if(service.returnType==request.GET.get('returnType')):
            serviceNames.append(service.name)
            serviceExes.append(service.exeName);

    response = []

    response.append(serviceExes)
    response.append(serviceNames)

    response = JsonResponse(response, safe=False)

    print response

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
