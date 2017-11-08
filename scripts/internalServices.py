from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from scripts import forms
import subprocess
import threading
from django.core.mail import send_mail

from fileSystem import views as fs


def executeInternalService(function_name, args, request):
    print "### Begin Internal Service"
    ThreadProcess = threading.Thread(target=eval(function_name), args=(args, request))
    ThreadProcess.daemon = True
    ThreadProcess.start()
    print "### End Internal Service"

def extractRepetitionsService(args, request):
    # <a0::frags.csv> <a1::boolSB> <a2::SBID>
    boolSB = args[1]
    CSB_id = args[2]
    # Load CSV
    file_name = args[0].rsplit('/')[-1]
    fileObject = userFile.objects.get(user = request.user, filename=file_name)
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
    if boolSB == "0":
        for line in lines[16:-1]:
            items = line.split(',')
            rep_flag = items[-1].replace('\n', '')
            if rep_flag == '0' or rep_flag == '1':
                content_clean_csv += line + "\n"
            elif rep_flag == '2':
                content_rep_csv += line + "\n"
    elif boolSB == "1":
        for line in lines[16:-1]:
            items = line.split(',')
            csb_flag = items[6]

            if csb_flag != CSB_id:
                content_clean_csv += line + "\n"
            elif csb_flag == CSB_id:
                content_rep_csv += line + "\n"
    # Create Files
    fileResult1 = fs.createFile(request=request, content=content_clean_csv, filename="CLEAN_" + file_name)
    fileResult2 = fs.createFile(request=request, content=content_rep_csv, filename="REPETITIONS_" + file_name)


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

    # Create OUTPUT content
    output_content = ""
    id_counter = 0
    # Read CSV lines and extract from X and Y/Yr
    for line in csv_lines[16:]:
        info = line.split(',')[0:6] # 0-frag/csb 1-xi 2-yi 3-xf 4-yf 5-strand

        if info[0] == 'Frag':
            x_extracted = extractSequenceFromFastaCoords(x_seq, int(info[1]), int(info[3]))
            if len(x_extracted) > 0:
                head = ">ID:" + str(id_counter) + ".0 |X: " + x_seq_info[0] + "|Start:" + str(info[1]) + "|End:" + str(info[3])
                output_content += head.replace('\n','') + "|\n"
                output_content += x_extracted + "\n"

            if info[5] == 'f':
                y_extracted = extractSequenceFromFastaCoords(y_seq, int(info[2]), int(info[4]))
                if len(x_extracted) > 0:
                    head = ">ID:" + str(id_counter) + ".1 |Y: " + y_seq_info[0] + "|Start:" + str(info[2]) + "|End:" + str(info[4])
                    output_content += head.replace('\n','') + "|\n"
                    output_content += y_extracted + "\n"
            elif info[5] == 'r':
                yr_extracted = extractSequenceFromFastaCoords(yr_seq, int(info[2]), int(info[4]))
                if len(x_extracted) > 0:
                    head = ">ID:" + str(id_counter) + ".2 |Yr: " + yr_seq_info[0] + "|Start:" + str(info[2]) + "|End:" + str(info[4])
                    output_content += head.replace('\n','') + "|\n"
                    output_content += yr_extracted + "\n"

            id_counter += 1

    # Create Files
    fileResult = fs.createFile(request=request, content=output_content, filename=args[4].rsplit('/')[-1])

### Helpers

def extractSequenceFromFastaCoords(fasta_sequence, start_n, end_n):
    if start_n > end_n:
        tmp = start_n
        start_n = end_n
        end_n = tmp

    return fasta_sequence[start_n:end_n]
