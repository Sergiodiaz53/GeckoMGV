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
    print "### Begin Internal Service"
    ThreadProcess = threading.Thread(target=function_name, args=[args, request])
    ThreadProcess.daemon = True
    ThreadProcess.start()
    print "### End Internal Service"

def extractRepetitionsService(args, request):
    # <a0::frags.csv>
    file_name = args[0].rsplit('/')[-1]
    fileObject = userFile.objects.get(user = request.user, filename=file_name)
    extension = fileObject.filename.rsplit('.',1)[1]

    lines = fs.openFile(request.user, fileObject).split('\n')

    # Extract HEADER
    headers = lines[0:16] # 16 HEADER LINES
    header = ""

    # Create CSV
    content_clean_csv = ""
    content_rep_csv = ""

    # Copy HEADER on new files
    for h in headers:
        header += h + "\n"

    content_clean_csv += header
    content_rep_csv += header

    # Filter LINES in CONTENT
    for line in lines[16:]:
        items = line.split(',')
        rep_flag = items[-1].replace('\n', '')
        coords = items[1:5]
        if rep_flag == '0':
            content_clean_csv += line + "\n"
        else:
            content_rep_csv += line + "\n"
    
    # Create Files
    fs.createFile(request=request, content=content_clean_csv, filename="CLEAN_" + file_name)
    fs.createFile(request=request, content=content_rep_csv, filename="REPETITIONS_" + file_name)


def extractSequenceFromCSVService(args, request):
    # <a0::frags.csv>  <a1::xseq.fasta> <a2::yseq.fasta> <a3::yrev.fasta> <a4::output>
    # Load CSV & FASTAS (frags, xseq, yseq and yrseq)
    csv_filename = args[0].rsplit('/')[-1]
    x_seq_filename = args[1].rsplit('/')[-1]
    y_seq_filename = args[2].rsplit('/')[-1]
    yr_seq_filename = args[3].rsplit('/')[-1]

    csv_fileObject = userFile.objects.get(user = request.user, filename=csv_filename)
    x_seq_fileObject = userFile.objects.get(user = request.user, filename=x_seq_filename)
    y_seq_fileObject = userFile.objects.get(user = request.user, filename=y_seq_filename)
    yr_seq_fileObject = userFile.objects.get(user = request.user, filename=yr_seq_filename)

    csv_lines = fs.openFile(request.user, csv_fileObject).split('\n')
    x_seq_info = fs.openFile(request.user, x_seq_fileObject).split('\n',1)
    y_seq_info = fs.openFile(request.user, y_seq_fileObject).split('\n',1)
    yr_seq_info = fs.openFile(request.user, yr_seq_fileObject).split('\n',1)

    x_seq = x_seq_info[1].replace('\n','')
    y_seq = x_seq_info[1].replace('\n','')
    yr_seq = x_seq_info[1].replace('\n','')

    print "X ID: " + str(x_seq_info[0])
    print "Y ID: " + str(y_seq_info[0])
    print "YR ID: " + str(yr_seq_info[0])

    # Create OUTPUT content
    output_content = ""
    id_counter = 0
    # Read CSV lines
    #   Per line: extract from X and extract from Y depending on strand (create extract function)
    for line in csv_lines[16:]:
        info = line.split(',')[0:6] # 0-frag/csb 1-xi 2-yi 3-xf 4-yf 5-strand

        if info[0] == 'Frag':
            output_content += ">ID:" + str(id_counter) + " | X: " + x_seq_info[0] + " | Start: " + str(info[1]) + " | End: " + str(info[3]) + " |\n"
            output_content += extractSequenceFromFastaCoords(x_seq, int(info[1]), int(info[3])) + "\n"

            if info[5] == 'f':
                output_content += ">ID:" + str(id_counter) + " | Y: " + y_seq_info[0] + " | Start: " + str(info[2]) + " | End: " + str(info[4]) + " |\n"
                output_content += extractSequenceFromFastaCoords(y_seq, int(info[2]), int(info[4])) + "\n"
            elif info[5] == 'r':
                output_content += ">ID:" + str(id_counter) + " | Yr: " + yr_seq_info[0] + " | Start: " + str(info[2]) + " | End: " + str(info[4]) + " |\n"
                output_content += extractSequenceFromFastaCoords(yr_seq, int(info[2]), int(info[4])) + "\n"

    # Create Files
    fs.createFile(request=request, content=output_content, filename=args[4].rsplit('/')[-1])#"SEQUENCES_" + csv_filename.replace('csv', 'fasta'))

def extractSequenceFromFastaCoords(fasta_sequence, start_n, end_n):
    if start_n > end_n:
        tmp = start_n
        start_n = end_n
        end_n = tmp

    return fasta_sequence[start_n:end_n]
