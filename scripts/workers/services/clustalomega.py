__author__ = 'pabrod'
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse

from scripts.workers.EBI import EBI
from scripts.forms import *

from fileSystem.forms import *
from fileSystem.views import *
from fileSystem.models import *

test = """>ID:0.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:218708|End:218728|
TCAAGAATTTCAATTGTTGA
>ID:1.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:760093|End:760124|
ATTTGCCTCCCGGATTTTACGGGAAATGCGT
>ID:1.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:248241|End:248272|
TTAGCTTTAAAATTTTCATTATCTAATTTTT
>ID:2.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:218693|End:218718|
TTATCTTTAAAAACATCAAGAATTT
>ID:2.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:705473|End:705498|
CACCAAAACAAGCGATGAAACCCGG
>ID:3.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:218693|End:218718|
TTATCTTTAAAAACATCAAGAATTT
>ID:3.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:705065|End:705090|
AAAACTACATAGGTTTTTATTGTTT
>ID:4.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:760106|End:760127|
ATTTTACGGGAAATGCGTTCA
>ID:4.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:724730|End:724751|
TTTAATTGAAATTTTTAGTTT
>ID:5.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:760114|End:760136|
GGAAATGCGTTCAGATCTGAGA
>ID:5.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:815618|End:815640|
AAACTTTAGAATATTTATCTTT
>ID:6.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:5|End:26|
AACAAATAAAAATAATTTAAA
>ID:6.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:248257|End:248278|
CATTATCTAATTTTTCAATAG
>ID:7.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:0|End:20|
ATGCAAACAAATAAAAATAA
>ID:7.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:705074|End:705094|
TAGGTTTTTATTGTTTTATT
>ID:8.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:0|End:20|
ATGCAAACAAATAAAAATAA
>ID:8.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:705482|End:705502|
AAGCGATGAAACCCGGGCAA
>ID:9.0 |X: >gi|54019969|ref|NC_006360.1| Mycoplasma hyopneumoniae 232 chromosome, complete genome|Start:218693|End:218717|
TTATCTTTAAAAACATCAAGAATT
>ID:9.1 |Y: >gi|525903163|ref|NC_021831.1| Mycoplasma hyopneumoniae 7422, complete genome|Start:54752|End:54776|
AAAATTTCCAGTATGAAAAAAATT
"""

def clustal_omega(request):

    baseUrl= u'https://www.ebi.ac.uk/Tools/services/rest/clustalo'
    params={}
    #file = open(str(userFile.objects.get(file=request.POST.get('parameter1')).file), 'r')
    content = test#file.read()
    #file.close()
    #print content
    params['sequence']=content
    params['mbediteration'] = True
    params['guidetreeout'] = True
    params['dismatout'] = True
    params['dealign'] = True
    params['mbed'] = True
    params['outfmt'] = 'clustal_num'
    jobid = EBI.serviceRun("sabega@uma.es", "Test", params, baseUrl)

    inner=EBI.getResult(jobid, 'aln-clustal_num',baseUrl)
    html = "<html><body><script src=\"https://s3-eu-west-1.amazonaws.com/biojs/msa/latest/msa.js\"></script><link type=text/css rel=stylesheet href=https://s3-eu-west-1.amazonaws.com/biojs/msa/latest/msa.css /><div id=\"menu\"></div><div id=\"msa\"></div></body></html>" #%inner.replace('\n','<br>').replace(' ','&ensp;')

    file_name = generatePath(request, inner[0])

    p = createFile(request=request, content=inner[1], filename=inner[0])

    msa_file = userFile.objects.get(user = request.user, filename=inner[0])

    content = openFile(request.user, msa_file)
    print content

    return content

    #return content;
