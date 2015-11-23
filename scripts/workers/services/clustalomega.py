__author__ = 'sabega'
from scripts.workers.EBI import EBI

def clustal_omega(request):
    baseUrl='http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    params={}
    params['sequence']=">\natcgtatcgatcg\n>\natcgatcgattca"
    params['mbediteration'] = True
    params['guidetreeout'] = True
    params['dismatout'] = True
    params['dealign'] = True
    params['mbed'] = True
    jobid = EBI.serviceRun("sabega@uma.es", "Test", params,baseUrl)
    inner=EBI.getResult(jobid, 'aln-clustal',baseUrl)
    html = "<html><body><tt>%s</tt></body></html>" %inner.replace('\n','<br>').replace(' ','&ensp;')
    return html;