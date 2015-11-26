__author__ = 'sabega'
import platform, os, sys, time, urllib
import urllib2
import urllib
import xml.etree.ElementTree as ET


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
            resp = reqH.read()
            result = resp
            reqH.close()
        # Errors are indicated by HTTP status codes.
        except urllib2.HTTPError as ex:
            # Trap exception and output the document to get error message.
            raise
        return result

def serviceRun(email, title, params,base):
    baseUrl=base
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
        jobId = str(reqH.read())
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

def serviceGetStatus(jobId,baseUrl):
    requestUrl = baseUrl + '/status/' + jobId
    status = restRequest(requestUrl)
    return status

def clientPoll(jobId,baseUrl):
    result = 'PENDING'
    while result == 'RUNNING' or result == 'PENDING':
        result = serviceGetStatus(jobId,baseUrl)
        if result == 'RUNNING' or result == 'PENDING':
            time.sleep(10)

def serviceGetResultTypes(jobId,baseUrl):
    requestUrl = baseUrl + '/resulttypes/' + jobId
    xmlDoc = restRequest(requestUrl)
    doc = ET.fromstring(xmlDoc)
    return doc.findall('type')

def serviceGetResult(jobId, type_,baseUrl):
    requestUrl = baseUrl + '/result/' + jobId + '/' + type_
    result = restRequest(requestUrl)
    return result

def getResult(jobId,type,baseUrl):
    # Check status and wait if necessary
    clientPoll(jobId,baseUrl)
    # Get available result types
    resultTypes = serviceGetResultTypes(jobId,baseUrl)
    for resultType in resultTypes:
        # Derive the filename for the result
        filename = jobId + '.' + str(resultType.findall('identifier')[0].text) + '.' + str(resultType.findall('fileSuffix')[0].text)
        # Get the result
        result = serviceGetResult(jobId, type,baseUrl)
        mediaType=str(resultType.findall('mediaType')[0].text)
        if(mediaType == "image/png"
            or mediaType == "image/jpeg"
            or mediaType == "application/gzip"):
            fmode= 'wb'
        else:
            fmode='w'

        fh = open(filename, fmode);

        fh.write(result)
        fh.close()
        print (filename)
        return(result)