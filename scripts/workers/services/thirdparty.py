__author__ = 'pabrod'
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse

from scripts.workers.EBI import EBI
from scripts.forms import *

from fileSystem.forms import *
from fileSystem.views import *
from fileSystem.models import *

def tp_execute(request, service_name):
    print "### Executing Third Party Service ###"
    content = eval(service_name+'(request)')
    print "### Finished Third Party Service ###"
    return content

def ClustalOmega(request):
    baseUrl= u'https://www.ebi.ac.uk/Tools/services/rest/clustalo'
    fout = request.POST.get('parameter2')
    print "FOUT :-: " + fout
    params={}
    file = open(str(userFile.objects.get(file=request.POST.get('parameter1')).file), 'r')
    content = file.read()
    file.close()
    #print content
    params['sequence']=content
    params['mbediteration'] = True
    params['guidetreeout'] = True
    params['dismatout'] = True
    params['dealign'] = True
    params['mbed'] = True
    jobid = EBI.serviceRun("sabega@uma.es", "Test", params, baseUrl)

    #file_name = generatePath(request, fout)

    inner=EBI.getResultV2(jobid, 'aln-clustal_num',baseUrl, fout)
    html = "<html><body><script src=\"https://s3-eu-west-1.amazonaws.com/biojs/msa/latest/msa.js\"></script><link type=text/css rel=stylesheet href=https://s3-eu-west-1.amazonaws.com/biojs/msa/latest/msa.css /><div id=\"menu\"></div><div id=\"msa\"></div></body></html>" #%inner.replace('\n','<br>').replace(' ','&ensp;')

    return inner
