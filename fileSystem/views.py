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


def createFile(request, content, filename):
    print "Creating file..."
    auxname = filename+".csv"
    path = generatePath(request, auxname)

    print userFile.objects.filter(file=path)
    x = 1

    while len(userFile.objects.filter(file=path)) != 0:
        auxname = filename+str(x)+'.csv'
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


def listUserFiles(request):
    if request.user.is_authenticated():
        files = userFile.objects.filter(user=request.user)
        return files

# Rendering methods
def fileManager_view(request):
    form = FileForm()
    if request.user.is_authenticated():
        files = userFile.objects.filter(user = request.user)
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

def createFile_view(request):
    createFile(request,"","newFile")
    return fileManager_view(request)

def fileViewer_view(request):
    if request.user.is_authenticated():

        file = open(str(userFile.objects.get(file=request.POST.get('filename')).file), 'r')
        content = file.read()
        file.close()

        fileInstance = userFile.objects.get(file=request.POST.get('filename'))

        return render(request, 'fileViewer.html', {'fileName': fileInstance.filename, 'content': content})

