from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from scripts import forms
from scripts.workers.services.thirdparty import tp_execute
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
        if service.path == 'ThirdParty':
            third_party_service = request.POST.get('exeName')
            content = tp_execute(request, third_party_service)
            #print content
            #return render(request, 'MSAvisualizer.html', {'content': content})
        else:
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
        file_info = os.stat(path)
        print "FILE SIZE :: " + str(file_info.st_size)
        print os.path.isfile(path)
        if file_info.st_size >= 5242880: # Clear log if >= 5MB
            file = open(path, 'wb')
            print "# -- LOG DELETED --"
            content = "..."
        else:
            file = open(path, 'r+b')
            content = file.read()
        content += "\n\n-----------------------------------NEXT SERVICE-----------------------------------\n\n" + output
        file.write(content)
        file.close()

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
            internal_service_name = request.POST.get('exeName')
            intService.executeInternalService(internal_service_name, args, request)
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

@csrf_exempt
def drawMSAVisualizer(request):
    print("TESTING...")
    if request.method == 'POST':
        f_name = request.POST.get('filename')
        file = open(str(userFile.objects.get(file=request.POST.get('filename')).file), 'r')
        content = file.read()
        file.close()

        #msa_file = userFile.objects.get(user = request.user, filename=f_name)
        #content = openFile(request.user, msa_file)

        print content
        return render(request, 'MSAvisualizer.html', {'content': content})
