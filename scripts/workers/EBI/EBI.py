__author__ = 'pabrod'
import platform, os, sys, time, urllib
import urllib2
import urllib
import xml.etree.ElementTree as ET


def getUserAgent():
    # Agent string for urllib2 library.
    urllib_agent = u'Python-urllib/%s' % urllib2.__version__
    clientRevision = u'$Revision: 2106 $'
    clientVersion = u'0'
    if len(clientRevision) > 11:
        clientVersion = clientRevision[11:-2]
    # Prepend client specific agent string.
    user_agent = u'EBI-Sample-Client/%s (%s; Python %s; %s) %s' % (
        clientVersion, os.path.basename( __file__ ),
        platform.python_version(), platform.system(),
        urllib_agent
    )
    return user_agent

def restRequest(url):
    try:
        # Set the User-agent.
        user_agent = getUserAgent()
        http_headers = { 'User-Agent' : user_agent }
        req = urllib2.Request(url, None, http_headers)
        # Make the request (HTTP GET).
        reqH = urllib2.urlopen(req)
        resp = reqH.read();
        contenttype = reqH.info()

        if(len(resp)>0 and contenttype!=u"image/png;charset=UTF-8"
            and contenttype!=u"image/jpeg;charset=UTF-8"
            and contenttype!=u"application/gzip;charset=UTF-8"):
            result = unicode(resp, u'utf-8')
        else:
            result = resp;
        reqH.close()
    # Errors are indicated by HTTP status codes.
    except urllib2.HTTPError as ex:
        # Trap exception and output the document to get error message.
        print ex.read()
        raise
    return result

def serviceRun(email, title, params, base):
    baseUrl=base
    # Insert e-mail and title into params
    params['email'] = email
    if title:
        params['title'] = title
    requestUrl = baseUrl + u'/run/'
    # Get the data for the other options
    requestData = urllib.urlencode(params)
    #requestData += urllib.urlencode("&database=ENA Sequence Release")
    #requestUrl += requestData
    # Errors are indicated by HTTP status codes.
    try:
        # Set the HTTP User-agent.
        user_agent = getUserAgent()
        http_headers = { 'User-Agent' : user_agent }
        req = urllib2.Request(requestUrl, None, http_headers)
        # Make the submission (HTTP POST).
        reqH = urllib2.urlopen(req, requestData.encode(encoding=u'utf_8', errors=u'strict'))
        #jobId = str(reqH.read())
        jobId = unicode(reqH.read(), u'utf-8')
        reqH.close()

    except urllib2.HTTPError as ex:
        # Trap exception and output the document to get error message.
        print ex.code
        print ex.read()
        raise
    return jobId

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
    requestUrl = baseUrl + u'/resulttypes/' + jobId
    print "---- request url ----"
    print requestUrl
    print "---- ------------ ----"
    xmlDoc = restRequest(requestUrl)

    doc = ET.fromstring(xmlDoc)
    return doc.findall('type')

def serviceGetResult(jobId, type_,baseUrl):
    requestUrl = baseUrl + '/result/' + jobId + '/' + type_
    result = restRequest(requestUrl)
    return result

def getResultV2(jobId,type,baseUrl, fout):
    # Check status and wait if necessary
    clientPoll(jobId,baseUrl)
    # Get available result types
    resultTypes = serviceGetResultTypes(jobId,baseUrl)
    for resultType in resultTypes:
        # Derive the filename for the result
        #filename = jobId + '.' + str(resultType.findall('identifier')[0].text) + '.' + str(resultType.findall('fileSuffix')[0].text)
        # Get the result
        result = serviceGetResult(jobId, type,baseUrl)
        mediaType=str(resultType.findall('mediaType')[0].text)
        if(mediaType == "image/png"
            or mediaType == "image/jpeg"
            or mediaType == "application/gzip"):
            fmode= 'wb'
        else:
            fmode='w'

        fh = open(fout, fmode);
        fh.write(result)
        fh.close()
        return result

# Deprecated
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

        #fh = open(filename, fmode);
        res = (filename, result)
        #fh.write(result)
        #fh.close()
        #print (result)
        return(res)
