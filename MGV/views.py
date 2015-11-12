from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from customAuth.views import *
from scripts.views import *
from fileSystem.forms import *
from fileSystem.views import *
import platform, os, sys, time, urllib
from optparse import OptionParser
import urllib2
import urllib
import xml.etree.ElementTree as ET

# Create your views here.

def index (request):
    print request.user
    return render(request, 'index.html')

def login_view(request):
    print "login_view_MGV"
    if request.method == 'POST':
        username = authLogin(request)
        print username
        if username is not None:
            return render(request, 'index.html')
        else:
            return HttpResponse("ERROR", content_type="text/plain")
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

def executeService_view(request):
    output = executeService(request)
    return render(request, 'serviceResult.html', {'output': output})

def clustal_omega(request):
    params={}
    params['sequence']="AAACGTGATC"
    params['mbediteration'] = True
    params['guidetreeout'] = True
    params['dismatout'] = True
    params['dealign'] = True
    params['mbed'] = True
    jobid = serviceRun("sabega@uma.es", "Test", params)
    # Base URL for service
    baseUrl = 'http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    requestUrl = baseUrl + '/parameters'
    xmlDoc = restRequest(requestUrl)
    doc = ET.fromstring(xmlDoc)
    inner=""
    for char in doc.findall('id'):
        inner+=char.text+" "
    now="dead"
    html = "<html><body>It is now \"%s\"</body></html>" %inner
    return HttpResponse(html);

def restRequest(url):
        try:
            # Set the User-agent.
            urllib_agent = 'Python-urllib/%s' % urllib2.__version__
            clientRevision = '$Revision: 2106 $'
            clientVersion = '0'
            if len(clientRevision) > 11:
                clientVersion = clientRevision[11:-2]
            # Prepend client specific agent string.
            user_agent = 'EBI-Sample-Client/%s (%s; Python %s; %s) %s' % (
                clientVersion, os.path.basename( __file__ ),
                platform.python_version(), platform.system(),
                urllib_agent
            )
            http_headers = { 'User-Agent' : user_agent }
            req = urllib2.Request(url, None, http_headers)
            # Make the request (HTTP GET).
            reqH = urllib2.urlopen(req)
            resp = reqH.read();
            result = resp;
            reqH.close()
        # Errors are indicated by HTTP status codes.
        except urllib2.HTTPError as ex:
            # Trap exception and output the document to get error message.
            raise
        return result

def serviceRun(email, title, params):
    baseUrl = 'http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    # Insert e-mail and title into params
    params['email'] = email
    if title:
        params['title'] = title
    requestUrl = baseUrl + '/run/'
    # Get the data for the other options
    requestData = urllib.urlencode(params)
    print(requestData)
    # Errors are indicated by HTTP status codes.
    try:
        # Set the HTTP User-agent.
        user_agent = getUserAgent()
        http_headers = { 'User-Agent' : user_agent }
        req = urllib2.Request(requestUrl, None, http_headers)
        # Make the submission (HTTP POST).
        reqH = urllib2.urlopen(req, requestData.encode(encoding='utf_8', errors='strict'),30)
        jobId = str(reqH.read(), 'utf-8')
        reqH.close()
    except urllib2.HTTPError as ex:
        # Trap exception and output the document to get error message.
        raise
    return jobId

def getUserAgent():
    # Agent string for urllib2 library.
    urllib_agent = 'Python-urllib/%s' % urllib2.__version__
    clientRevision = '$Revision: 2106 $'
    clientVersion = '0'
    if len(clientRevision) > 11:
        clientVersion = clientRevision[11:-2]
    # Prepend client specific agent string.
    user_agent = 'EBI-Sample-Client/%s (%s; Python %s; %s) %s' % (
        clientVersion, os.path.basename( __file__ ),
        platform.python_version(), platform.system(),
        urllib_agent
    )
    return user_agent

def serviceGetStatus(jobId):
    baseUrl = 'http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    requestUrl = baseUrl + '/status/' + jobId
    status = restRequest(requestUrl)
    return status

def clientPoll(jobId):
    result = 'PENDING'
    while result == 'RUNNING' or result == 'PENDING':
        result = serviceGetStatus(jobId)
        if result == 'RUNNING' or result == 'PENDING':
            time.sleep(10)

def serviceGetResultTypes(jobId):
    baseUrl = 'http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    requestUrl = baseUrl + '/resulttypes/' + jobId
    xmlDoc = restRequest(requestUrl)
    doc = ET.parse(xmlDoc)
    return 0 #doc['type':]

def serviceGetResult(jobId, type_):
    baseUrl = 'http://www.ebi.ac.uk/Tools/services/rest/clustalo'
    requestUrl = baseUrl + '/result/' + jobId + '/' + type_
    result = restRequest(requestUrl)
    return result

def getResult(jobId):
    # Check status and wait if necessary
    clientPoll(jobId)
    # Get available result types
    resultTypes = serviceGetResultTypes(jobId)
    for resultType in resultTypes:
        # Derive the filename for the result
        filename = jobId + '.' + str(resultType['identifier']) + '.' + str(resultType['fileSuffix'])
        # Get the result
        result = serviceGetResult(jobId, str(resultType['identifier']))
        if(str(resultType['mediaType']) == "image/png"
            or str(resultType['mediaType']) == "image/jpeg"
            or str(resultType['mediaType']) == "application/gzip"):
            fmode= 'wb'
        else:
            fmode='w'

        fh = open(filename, fmode);

        fh.write(result)
        fh.close()
        print (filename)