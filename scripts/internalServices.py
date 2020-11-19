from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from scripts.forms import *
from fileSystem.models import *
from scripts import forms
import subprocess
import threading
from django.core.exceptions import ObjectDoesNotExist

from fileSystem import views as fs


FRAGSTART = 17
### Threading

def executeInternalService(function_name, args, request):
    print "### Begin Internal Service"
    ThreadProcess = threading.Thread(target=threadInit, args=(function_name, args, request))
    ThreadProcess.daemon = True
    ThreadProcess.run()
    print "### End Internal Service"

def threadInit(function_name, args, request):
    print "--- Thread Init ---"
    eval(function_name+'(args,request)')
    print "--- Thread End ---"

### Services

    # REPTOPNG <a0::input> <a1::output> <a2::clearRep (1 quita rep, 0 deja)>

def filterFragsService(args, request):
    # <a0::input> <a1::output> <a2::filterIdentity> <a3::filterLenght> <a4::filterSimilarity>
    input_f = args[0].rsplit('/')[-1]
    output_f = args[1]
    filter_identity_number = float(args[2])
    filter_lenght_number = float(args[3])
    filter_similarity_number = float(args[4])

    # Load CSV
    fileObject = userFile.objects.get(user = request.user, filename=input_f)
    lines = fs.openFile(request.user, fileObject).split('\n')

    # Extract HEADER
    headers = lines[0:FRAGSTART] # 16 HEADER LINES
    header = ""

    # Create new CSVfile
    output_file_csv = ""

    # Filter LINES in CONTENT
    for line in lines[FRAGSTART:]:
        items = line.split(',')
        current_identity = float(items[11])
        current_length = float(items[7])
        current_similarity = float(items[10])

        filter_identity = (current_identity >= filter_identity_number)
        filter_length = (current_length >= filter_lenght_number)
        filter_similarity = (current_similarity >= filter_similarity_number)

        if filter_identity and filter_length and filter_similarity:
            output_file_csv += line + "\n"
    
    # Copy HEADER on new files
    headers[12] = "Total Fragments :  " + str( output_file_csv.count('\n') )
    for h in headers:
        header += h + "\n"

    
    # Create Files
    fs.createFile(request=request, content=(header + output_file_csv), filename=output_f)

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

    # Create CSV
    content_clean_csv = ""
    content_rep_csv = ""

    #content_clean_csv += header
    #content_rep_csv += header

    # Filter LINES in CONTENT
    if boolSB == "0":
        for line in lines[FRAGSTART:-1]:
            items = line.split(',')
            rep_flag = items[-1].replace('\n', '')
            if rep_flag == '0' or rep_flag == '1':
                content_clean_csv += line + "\n"
            elif rep_flag == '2':
                content_rep_csv += line + "\n"
    elif boolSB == "1":
        for line in lines[FRAGSTART:-1]:
            items = line.split(',')
            csb_flag = items[6]

            if csb_flag != CSB_id:
                content_clean_csv += line + "\n"
            elif csb_flag == CSB_id:
                content_rep_csv += line + "\n"

    # Create Files
    header = ""
    headers[12] = "Total Fragments :  " + str( content_clean_csv.count('\n') )
    for h in headers:
        header += h + "\n"
    fs.createFile(request=request, content=(header + content_clean_csv), filename="CLEAN_" + file_name)

    header = ""
    headers[12] = "Total Fragments :  " + str( content_rep_csv.count('\n') )
    for h in headers:
        header += h + "\n"
    fs.createFile(request=request, content=(header + content_rep_csv), filename="REPETITIONS_" + file_name)


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
    for line in csv_lines[FRAGSTART:]:
    # A = [1,2,3]
    # print(A[0:-1])
        info = line.split(',')[0:6] # 0-frag/csb 1-xi 2-yi 3-xf 4-yf 5-strand

        if info[0] == 'Frag':
            x_extracted = extractSequenceFromFastaCoords(x_seq, int(info[1]), int(info[3]))
            if x_extracted != '':
                head = ">ID-" + str(id_counter) + ".0 X_" + str(info[1]) + "_" + str(info[3]) + "_" + x_seq_info[0][1:].replace('|','_').replace(' ','-').replace(',', '')
                output_content += head.replace('\n','') + "\n"
                output_content += x_extracted + "\n"

            if info[5] == 'f':
                y_extracted = extractSequenceFromFastaCoords(y_seq, int(info[2]), int(info[4]))
                if y_extracted != '':
                    head = ">ID-" + str(id_counter) + ".1 Y_" + str(info[2]) + "_" + str(info[4]) + "_"  + y_seq_info[0][1:].replace('|','_').replace(' ','-').replace(',', '')
                    output_content += head.replace('\n','') + "\n"
                    output_content += y_extracted + "\n"

            elif info[5] == 'r':
                yr_extracted = extractSequenceFromFastaCoords(yr_seq, int(info[2]), int(info[4]))
                if yr_extracted != '':
                    head = ">ID-" + str(id_counter) + ".2 Yr_" + str(info[2]) + "_" + str(info[4]) + "_" + yr_seq_info[0][1:].replace('|','_').replace(' ','-').replace(',', '')
                    output_content += head.replace('\n','') + "\n"
                    output_content += yr_extracted + "\n"

            id_counter += 1



    # Create Files
    fs.createFile(request=request, content=output_content, filename=args[4].rsplit('/')[-1])

### Helpers

def extractSequenceFromFastaCoords(fasta_sequence, start_n, end_n):
    if start_n > end_n:
        tmp = start_n
        start_n = end_n
        end_n = tmp

    return fasta_sequence[start_n:end_n]
