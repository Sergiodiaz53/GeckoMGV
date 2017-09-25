from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from scripts import forms
from scripts.workers.services import clustalomega as co
import subprocess
import threading
from django.core.mail import send_mail

from fileSystem import views as fs

def storeService(request):
    if request.method == 'POST':
        form = RegisterService(request.POST)
        if form.is_valid():
            script = form.save(commit=False)
            script.save()
    return HttpResponse("OK", content_type="text/plain")

@login_required()
def executeService(request):
    print request.POST
    if request.method == 'POST':
        if request.POST.get('exeName')!= 'clustal':
            service = Script.objects.get(exeName=request.POST.get('exeName'))
            auxForm = getattr(forms, service.form)
            form = auxForm(user = request.user, request=request)
            args = []

            for i in xrange(1, (len(form.fields))+1):
                idParamater = 'parameter'+str(i)
                args.append(request.POST.get(idParamater))

            # Check ServiceType (Internal or External)
            if service.returnType == 'Internal':
                # If -1 service is not registered
                #executeInternalService(registeredInternalServices(request.POST.get('exeName')), args, request)
                executeInternalService(eval(request.POST.get('exeName')), args, request)
                return render(request, 'filemanager.html')
            else:
                print os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))
                command = [os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))]
                command.extend(args)

                ThreadProcess = threading.Thread(target=runServiceInThread, args=(command, request))
                ThreadProcess.daemon = True
                ThreadProcess.start()

                #fileResult = createFile(request, output, request.POST.get('nameFileResult'))
                return render(request, 'filemanager.html')
        else:
            content=co.clustal_omega(request)
            return render(request, 'MSAvisualizer.html', {'content': content})

def runServiceInThread (command, request):
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

    send_mail(
        'Subject here',
        'Here is the message.',
        'geckomgvsupport@gmail.com',
        ['sergiodiazdp@gmail.com'],
        fail_silently=False,
    )


@csrf_exempt
def executeServiceInBackground(request):

    if request.method == 'POST':
        service = Script.objects.get(exeName=request.POST.get('exeName'))
        auxForm= getattr(forms, service.form)
        form = auxForm(user = request.user, request=request)
        args = []

        for i in xrange(1, (len(form.fields))+1):
            idParamater = 'parameter'+str(i)
            args.append(request.POST.get(idParamater))
            #print "/**\n"
            #print form
            #print "\n**/"

        print os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))
        command = [os.path.join(settings.MEDIA_ROOT, service.path+request.POST.get('exeName'))]
        command.extend(args)
        output = subprocess.Popen(command, stdout=subprocess.PIPE).communicate()[0]

        print args

        createFile(request, output, request.POST.get('nameFileResult'))
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

# Propietary functions

def executeInternalService(function_name, params, request):
    print "BEGIN PROPIETARY SERVICE"

    ThreadProcess = threading.Thread(target=function_name, args=[params, request])
    ThreadProcess.daemon = True
    ThreadProcess.start()

    print "END PROPIETARY SERVICE"

def registeredInternalServices(function_name):
    internal_services = {'extractRepetitionsService' : extractRepetitionsService}

    if function_name in internal_services:
        return internal_services[function_name]
    else:
        return -1

def extractRepetitionsService(args, request):
    # Unregistered Service
    #fileObject = userFile.objects.get(user = request.user, filename=request.GET.get('filename'))
    '''# Registered Service
    print "ARGS - " + str(args)
    print "REQUEST - " + str(request.user)
    fileObject = userFile.objects.get(user = request.user, filename=args[0])
    '''
    fileObject = userFile.objects.get(user = request.user, filename=args[0].rsplit('/')[-1])
    extension = fileObject.filename.rsplit('.',1)[1]
    file_location = str(fileObject.file).rsplit('/')
    file_name = file_location[-1]
    
    # Create PATH
    file_dir = ""
    for fl in file_location[:-1]:
        file_dir += fl + '/'

    full_csv = fs.openFile(request.user, fileObject)
    lines = full_csv.split('\n')
    headers = lines[0:16] # 16 HEADER LINES
    header = ""

    # Create CONTENT
    # CSV
    content_clean_csv = ""
    content_rep_csv = ""
    # FASTA
    content_clean_fasta = ""
    content_rep_fasta = ""

    # Create HEADER
    for h in headers:
        header += h + "\n"

    content_clean_csv += header
    content_rep_csv += header

    # Filter LINES CONTENT
    for line in lines[16:]:
        items = line.split(',')
        rep_flag = items[-1].replace('\n', '')
        coords = items[1:5]
        if rep_flag == '0':
            content_clean_csv += line + "\n"
            content_clean_fasta += str(coords) + "\n"
        else:
            content_rep_csv += line + "\n"
            content_rep_fasta += str(coords) + "\n"
    
    # Create Files
    fs.createFile(request=request, content=content_clean_csv, filename="CLEAN_" + file_name)
    fs.createFile(request=request, content=content_rep_csv, filename="REPETITIONS_" + file_name)

    fs.createFile(request=request, content=content_clean_fasta, filename="CLEAN_" + file_name.replace(extension,"fasta"))
    fs.createFile(request=request, content=content_rep_fasta, filename="REPETITIONS_" + file_name.replace(extension,"fasta"))