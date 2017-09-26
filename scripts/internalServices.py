from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from scripts import forms
from scripts.workers.services import clustalomega as co
import subprocess
import threading
from django.core.mail import send_mail

from fileSystem import views as fs


def executeInternalService(function_name, args, request):
    ThreadProcess = threading.Thread(target=function_name, args=[args, request])
    ThreadProcess.daemon = True
    ThreadProcess.start()

def extractRepetitionsService(args, request):
    # Unregistered Service
    #fileObject = userFile.objects.get(user = request.user, filename=request.GET.get('filename'))
    '''# Registered Service
    print "ARGS - " + str(args)
    print "REQUEST - " + str(request.user)
    fileObject = userFile.objects.get(user = request.user, filename=args[0])

    #file_location = str(fileObject.file).rsplit('/')
    #file_name = file_location[-1]
    '''
    file_location = args[0].rsplit('/')
    file_name = file_location[-1]
    fileObject = userFile.objects.get(user = request.user, filename=file_name)
    extension = fileObject.filename.rsplit('.',1)[1]
    
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

    # fs.createFile(request=request, content=content_clean_fasta, filename="CLEAN_" + file_name.replace(extension,"fasta"))
    # fs.createFile(request=request, content=content_rep_fasta, filename="REPETITIONS_" + file_name.replace(extension,"fasta"))

def extractSequenceFromCSV(args, request):
    # Load FASTAS (x,y and yr)
    # Load CSV and read line by line
    #   Per line: extract from X and extract from Y depending on strand (create extract function)
    #   Rewind FASTAS used