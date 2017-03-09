from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from customAuth.views import *
from scripts.views import *
from fileSystem.forms import *
from fileSystem.views import *
from scripts.workers.services import clustalomega as co
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse
import json

# Create your views here.


def index (request):
    print request.user
    return render(request, 'index.html')

def contact(request):
    return render(request,'contact.html')

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
@login_required()
def uploadFrags(request):
    if request.method == 'POST':
        createFile(request,request.POST['content'],request.POST['name'])
        return HttpResponse(status=201)
    else:
        return HttpResponse(status=501)

@csrf_exempt
def loadFileFromServer(request):
    fileObject = userFile.objects.get(user = request.user, filename=request.GET.get('filename'))
    extension = fileObject.filename.rsplit('.',1)[1]
    args = [str(fileObject.file), 'Anot_'+fileObject.filename]

    if extension == 'gbff':
        command = [os.path.join(settings.MEDIA_ROOT, 'scripts/WritePTT_FAAfromGBK')]
        command.extend(args)
        print command
        output = subprocess.Popen(command, stdout=subprocess.PIPE).communicate()[0]
        with open('Anot_'+fileObject.filename+'.ptt', 'r') as content_file:
            content = content_file.read()
        os.remove('Anot_'+fileObject.filename+'.ptt')
    else :
        content = openFile(request.user,fileObject)

    return HttpResponse(content, content_type="text/plain")


@csrf_exempt
def getFileList(request):
    extension = request.GET.get('extension')
    fileNames = []
    for file in listUserFiles(request):
        if file.filename.split('.').pop() == extension:
            fileNames.append(file.filename)
    response = JsonResponse(fileNames, safe=False)
    return HttpResponse(response, content_type="application/json")

@login_required()
def executeService_view(request):
    output = executeService(request)
    return render(request, 'serviceResult.html', {'output': output})


def contact_view(request):
    return render(request, 'contact.html')


def help_view(request):
    return render(request, 'help.html')

def loginrequired_view(request):
    return render(request, 'loginrequired.html')


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
