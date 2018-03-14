from django.conf import settings

def printDirectoryConfig():
    print "Directory configuration: "
    print "BASE_DIR path: ", settings.BASE_DIR
    print "PROJECT_ROOT path: ", settings.PROJECT_ROOT
    print "STATIC_URL path: ", settings.STATIC_URL
    #print "STATICFILES_DIRS path: ", settings.STATICFILES_DIRS
    print "MEDIA_URL path: ", settings.MEDIA_URL
    print "MEDIA_ROOT path: ", settings.MEDIA_ROOT

printDirectoryConfig()

