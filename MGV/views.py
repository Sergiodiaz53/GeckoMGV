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

from django.core.files.storage import default_storage
from fileSystem import views as fs
import os

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
            return render(request, 'loginrequired.html')
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

@login_required()
def removeRepetitions(request):
    print "REQUEST METHOD : " + request.method
    # ----
    fileObject = userFile.objects.get(user = request.user, filename=request.GET.get('filename'))
    extension = fileObject.filename.rsplit('.',1)[1]
    file_location = str(fileObject.file).rsplit('/')
    file_name = file_location[-1]
    # Create Path
    file_dir = ""
    for fl in file_location[:-1]:
        file_dir += fl + '/'

    print "File Object: " + str(fileObject.file)
    print "File Directory: " + file_dir
    print "Extension: " + extension

    print "------ DEBUG BEGIN -----"
    #with fs.openFile(request.user, fileObject) as full_csv:
    full_csv = fs.openFile(request.user, fileObject)
    print "------ DEBUG OPEN FILE -----"
    lines = full_csv.split('\n')
    #lines = full_csv.readlines()
    headers = lines[0:16] # 16 HEADER LINES
    header = ""

    # Create CSVs
    # CSB
    #repetitions_csv = default_storage.open(file_dir + "REPETITIONS_" + file_name,'wb')
    #clean_csv = default_storage.open(file_dir + "CLEAN_" + file_name, 'wb')
    content_clean_csv = ""
    content_rep_csv = ""

    # FASTA
    #repetitions_fasta = default_storage.open(file_dir + "REPETITIONS_" + file_name.replace(extension,"fasta"),'wb')
    #clean_fasta = default_storage.open(file_dir + "CLEAN_" + file_name.replace(extension,"fasta"),'wb')

    content_clean_fasta = ""
    content_rep_fasta = ""
    # Create HEADER
    for h in headers:
        header += h

    content_clean_csv += header
    content_rep_csv += header
    #repetitions_csv.write(header)
    #clean_csv.write(header)

    # Filter LINES CONTENT
    print "------ DEBUG LINE CONTENT-----"
    for line in lines[16:]:
        items = line.split(',')
        rep_flag = items[-1].replace('\n', '')
        coords = items[1:5]
        if rep_flag == '0':
            content_clean_csv += line
            content_clean_fasta += str(coords) + "\n"
            #clean_csv.write(line)
            #clean_fasta.write(str(coords) + "\n")
        else:
            content_rep_csv += line
            content_rep_fasta += str(coords) + "\n"
            #repetitions_csv.write(line)
            #repetitions_fasta.write(str(coords) + "\n")
    
    # Close CSVs
    fs.createFile(request=request, content=content_clean_csv, filename="CLEAN_" + file_name)
    fs.createFile(request=request, content=content_rep_csv, filename="REPETITIONS_" + file_name)

    fs.createFile(request=request, content=content_clean_fasta, filename="CLEAN_" + file_name.replace(extension,"fasta"))
    fs.createFile(request=request, content=content_rep_fasta, filename="REPETITIONS_" + file_name.replace(extension,"fasta"))
    #clean_csv.close()
    #repetitions_csv.close()
    #clean_fasta.close()
    #repetitions_fasta.close()

    print "------ DEBUG END -----"
    print "LENGTH IN LINES: " + str(len(lines))
    # ----
    return HttpResponse(status=200)

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
