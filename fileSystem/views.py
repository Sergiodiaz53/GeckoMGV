from django.http import HttpResponse, JsonResponse
from MGV.views import *
from fileSystem.models import *
from fileSystem.forms import *


# Methods


def uploadFile(request):
    print "UploadingFile..."
    if request.method == 'POST':
        form = FileForm(request.POST, request.FILES)
        if form.is_valid():
            newFile = userFile(user=request.user, filename=request.FILES['userfile'].name, file=request.FILES['userfile'])
            newFile.save()
    return userFile.objects.filter(user = request.user)

@csrf_exempt
def createFilePost_view(request):
    path = generatePath(request, 'filename')
    auxFile = createFile(request,request.POST.get('content'),request.POST.get('filename'))
    return HttpResponse(auxFile.file.__str__())

def createFile(request, content, filename):
    print "Creating file..."
    auxname = filename#+".csv"
    path = generatePath(request, auxname)

    print userFile.objects.filter(file=path)
    x = 1

    while len(userFile.objects.filter(file=path)) != 0:
        if filename.rfind('.')>0 & filename.rfind('.')<len(filename):
            auxname = filename[:filename.rfind('.')]+"("+str(x)+")"+filename[filename.rfind('.'):]#+'.csv'
        else:
            auxname = filename+"("+str(x)+")"
        path = generatePath(request, auxname)
        x += 1

    file = open(path,'wb')
    file.write(content)
    file.close()
    newFile = userFile(user=request.user, filename=auxname, file=path)
    newFile.save()

    return userFile.objects.get(file=path)


def deleteFile(request):
    print "Deleting File..."
    if request.method == 'POST':
        form = DeleteFileForm(request.POST)
        if form.is_valid():
            userFile.objects.get(file=request.POST.get('filename')).delete()
            os.remove(request.POST.get('filename'))
    return userFile.objects.filter(user=request.user)


def openFile(user, file):
    if user.is_authenticated():
        auxfile = open(str(file.file), 'r')
        content = auxfile.read()
        auxfile.close()
        return content

def listUserFiles(request):
    if request.user.is_authenticated():
        files = userFile.objects.filter(user=request.user)
        return files

# Rendering methods
def fileManager_view(request):
    form = FileForm()
    if request.user.is_authenticated():
        files = userFile.objects.filter(user = request.user)
        print "going to render"
        return render(request, 'filemanager.html', {'form': form, 'files': files})
    else:
        return render(request, 'filemanager.html', {'form': form, 'files': {} })


def uploadFile_view(request):
    form = FileForm()
    files = uploadFile(request)
    return render(request, 'filemanager.html', {'form': form, 'files': files})


def deleteFile_view(request):
    form = FileForm()
    files = deleteFile(request)
    return render(request, 'filemanager.html', {'form': form, 'files': files})
@csrf_exempt
def createFile_view(request):
    createFile(request,request.POST.get('content'),request.POST.get('filename'))
    return fileManager_view(request)

def fileViewer_view(request):
    if request.user.is_authenticated():

        file = open(str(userFile.objects.get(file=request.POST.get('filename')).file), 'r')
        content = file.read()
        file.close()

        fileInstance = userFile.objects.get(file=request.POST.get('filename'))

        return render(request, 'fileViewer.html', {'fileName': fileInstance.filename, 'content': content})

@csrf_exempt
def consoleViewer_view(request):
    if request.user.is_authenticated():
        path= generatePath(request, 'log')
        if not os.path.isfile(path):
            return render(request, 'fileViewer.html', {'fileName': "console.log", 'content': ''})
        else:
            file = open(path, 'r')
            content=file.read()
            file.close()
            return render(request, 'fileViewer.html', {'fileName': "console.log", 'content': content})