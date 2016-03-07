
#!/bin/bash

FL=1000   # frequency limit
MG=0

if [ $# -lt 2 ]; then
   echo " ==== ERROR ... you called this script inappropriately."
   echo ""
   echo "   usage:  $0 seqXName seqYName "
   echo ""
   exit -1
fi



BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

dirNameX=$(${BINDIR}/readlink.sh $1 | xargs dirname)
seqXName=$(basename "$1")
extensionX="${seqXName##*.}"
seqXName="${seqXName%.*}"

dirNameY=$(${BINDIR}/readlink.sh $2 | xargs dirname)
seqYName=$(basename "$2")
extensionY="${seqYName##*.}"
seqYName="${seqYName%.*}"


mkdir ${seqXName}-${seqYName}
cd ${seqXName}-${seqYName}


	echo "------------ progressive mauve ---------"
	echo "~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ../$1 ../$2"
	~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ../$1 ../$2

	echo "------------- paso a csb-------------"
	echo "${BINDIR}/fromMauve2CSB ${seqXName}-${seqYName}.mauve.backbone ${seqXName}-${seqYName}.mauve.master ../$1 ../$2"
	${BINDIR}/fromMauve2CSB ${seqXName}-${seqYName}.mauve.backbone ${seqXName}-${seqYName}.mauve.master ../$1 ../$2