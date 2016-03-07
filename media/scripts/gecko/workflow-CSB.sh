#!/bin/bash

FL=1000   # frequency limit
MG=0

if [ $# -lt 6 ]; then
   echo " ==== ERROR ... you called this script inappropriately."
   echo ""
   echo "   usage:  $0 seqXName seqYName lenght similarity WL fixedL"
   echo ""
   exit -1
fi

if [ $# == 7 ]; then
   MG=$7
fi

{

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

dirNameX=$(${BINDIR}/readlink.sh $1 | xargs dirname)
seqXName=$(basename "$1")
extensionX="${seqXName##*.}"
seqXName="${seqXName%.*}"

dirNameY=$(${BINDIR}/readlink.sh $2 | xargs dirname)
seqYName=$(basename "$2")
extensionY="${seqYName##*.}"
seqYName="${seqYName%.*}"

#seqXName=`basename $1 .fasta`
#seqYName=`basename $2 .fasta`

length=${3}
similarity=${4}
WL=${5} # wordSize
fixedL=${6}

mkdir intermediateFiles

mkdir intermediateFiles/${seqXName}-${seqYName}
mkdir results
mkdir intermediateFiles/dictionaries
mkdir intermediateFiles/hits

mkdir csv
mkdir csb
mkdir comparaciones
mkdir hist



# Copiamos los fastas
ln -s ${dirNameX}/${seqXName}.${extensionX} intermediateFiles/${seqXName}-${seqYName}
ln -s ${dirNameY}/${seqYName}.${extensionY} intermediateFiles/${seqXName}-${seqYName}



cd intermediateFiles/${seqXName}-${seqYName}


mkdir GRIMM
cd GRIMM
mkdir anchor
cd ..
###############


echo "${BINDIR}/reverseComplement ${seqYName}.${extensionX} ${seqYName}-revercomp.${extensionY}"
${BINDIR}/reverseComplement ${seqYName}.${extensionX} ${seqYName}-revercomp.${extensionY}

echo "${BINDIR}/reverseComplement ${seqXName}.${extensionX} ${seqXName}-revercomp.${extensionX}"
${BINDIR}/reverseComplement ${seqXName}.${extensionX} ${seqXName}-revercomp.${extensionX}

if [[ ! -f ../dictionaries/${seqXName}.d2hP ]];	then
	echo "${BINDIR}/dictionary.sh ${seqXName}.${extensionX} 8 &"
	${BINDIR}/dictionary.sh ${seqXName}.${extensionX} 8 &		
fi
		
if [[ ! -f ../dictionaries/${seqYName}.d2hP ]];	then
	echo "${BINDIR}/dictionary.sh ${seqYName}.${extensionY} 8 &"
	${BINDIR}/dictionary.sh ${seqYName}.${extensionY} 8 &
fi
		
if [[ ! -f ../dictionaries/${seqYName}-revercomp.d2hP ]];	then
	echo "${BINDIR}/dictionary.sh ${seqYName}-revercomp.${extensionY} 8 &"
	${BINDIR}/dictionary.sh ${seqYName}-revercomp.${extensionY} 8 &
fi		

echo "Waiting for the calculation of the dictionaries"

for job in `jobs -p`
do
    #echo $job
    wait $job
done


mv ${seqXName}.d2hP ../dictionaries/
mv ${seqXName}.d2hW ../dictionaries/
mv ${seqYName}.d2hP ../dictionaries/
mv ${seqYName}.d2hW ../dictionaries/
mv ${seqYName}-revercomp.d2hP ../dictionaries/
mv ${seqYName}-revercomp.d2hW ../dictionaries/
		
# Hacemos enlace simbolico
ln -s ../dictionaries/${seqXName}.d2hP .
ln -s ../dictionaries/${seqXName}.d2hW .

ln -s ../dictionaries/${seqYName}.d2hP .
ln -s ../dictionaries/${seqYName}.d2hW .

ln -s ../dictionaries/${seqYName}-revercomp.d2hP .
ln -s ../dictionaries/${seqYName}-revercomp.d2hW .

echo "${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${length} ${similarity} ${WL} ${fixedL} f &"
${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${length} ${similarity} ${WL} ${fixedL} f &

echo "${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}-revercomp.${extensionY} ${length} ${similarity} ${WL} ${fixedL} r &"
${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}-revercomp.${extensionY} ${length} ${similarity} ${WL} ${fixedL} r &

echo "Waiting for the comparisons"

for job in `jobs -p`
do
    #echo $job
    wait $job
done

#echo "rm ${seqYName}-revercomp.${extensionY}"
#rm ${seqYName}-revercomp.${extensionY}

echo "${BINDIR}/combineFrags ${seqXName}-${seqYName}-sf.frags ${seqXName}-${seqYName}-revercomp-sr.frags ${seqXName}-${seqYName}.frags"
${BINDIR}/combineFrags ${seqXName}-${seqYName}-sf.frags ${seqXName}-${seqYName}-revercomp-sr.frags ${seqXName}-${seqYName}.frags

#echo "${BINDIR}/newFragToBalazsVersion ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.old.frags"
#${BINDIR}/newFragToBalazsVersion ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.old.frags

#echo "${BINDIR}/af2pngrev ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.png ${seqXName} ${seqYName}"
#${BINDIR}/af2pngrev ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.png ${seqXName} ${seqYName}
	# Calc ACGT frequencies
        echo "${BINDIR}/getFreqFasta ${seqXName}.${extensionX} ${seqXName}.freq"
        ${BINDIR}/getFreqFasta ${seqXName}.${extensionX} ${seqXName}.freq

        #Calc karlin parameters
        echo "${BINDIR}/kar2test ${seqXName}.freq ${BINDIR}/matrix.mat 1 ${seqXName}.karpar"
        ${BINDIR}/kar2test ${seqXName}.freq ${BINDIR}/matrix.mat 1 ${seqXName}.karpar

        #rm -rf ${seqXName}.freq

        echo "----------- p-value filter --------------"
        ## Filtro por pvalue
        echo "${BINDIR}/pvalueFilter ${seqXName}-${seqYName}.frags ${seqXName}.karpar ${seqXName}-${seqYName}.fil.frags ${seqXName}-${seqYName}.trash.frags "
        ${BINDIR}/pvalueFilter ${seqXName}-${seqYName}.frags ${seqXName}.karpar ${seqXName}-${seqYName}.fil.frags ${seqXName}-${seqYName}.trash.frags 1


${BINDIR}/fragstoMaster ${seqXName}-${seqYName}.fil.frags ${seqXName}-${seqYName}.original.master

${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master 0 > ${seqXName}-${seqYName}.original.csv.tmp

cat ${seqXName}-${seqYName}.csb.frags.INF ${seqXName}-${seqYName}.original.csv.tmp > ${seqXName}-${seqYName}.original.csv
	


# calculamos hits en txt
#${BINDIR}/getHistogramFromHits ${seqXName}-${seqYName}-revercomp-K${WL}.hits.sorted ${seqXName}-${seqYName}-K${WL}.histXrever.txt ${seqXName}-${seqYName}-K${WL}.histYrever.txt r 0 

#${BINDIR}/getHistogramFromHits ${seqXName}-${seqYName}-K${WL}.hits.sorted ${seqXName}-${seqYName}-K${WL}.histX.txt ${seqXName}-${seqYName}-K${WL}.histY.txt f 0
 
#Borramos todo menos los frags y los diccionarios


cat ${seqXName}-${seqYName}.frags.INF ${seqXName}-${seqYName}.original.csv > ${seqXName}-${seqYName}.csv
mv ${seqXName}-${seqYName}.csv ../../csv
mv ${seqXName}-${seqYName}.frags ../../results
mv ${seqXName}-${seqYName}.frags.INF ../../results
mv ${seqXName}-${seqYName}.frags.MAT ../../results
#mv ${seqXName}-${seqYName}-K${WL}.histXrever.txt ../../hist
#mv ${seqXName}-${seqYName}-K${WL}.histYrever.txt ../../hist
#mv ${seqXName}-${seqYName}-K${WL}.histX.txt ../../hist 
#mv ${seqXName}-${seqYName}-K${WL}.histY.txt ../../hist

##### Computing CSB

# Extract Overlapped frags
${BINDIR}/extractOverlapped ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.notOverlapped 100 1 ${seqXName}-${seqYName}.overlapped
# Refine overlapped frags
${BINDIR}/refineOverlapped ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.overlapped ${seqXName}-${seqYName}.notOverlapped ${seqXName}-${seqYName}.new.master ${seqXName}-${seqYName}.refined.overlapped ${seqXName}-${seqYName}.refined.notOverlapped
# Calculate tandem repeats and IR
${BINDIR}//clasifyRepeats ${seqXName}-${seqYName}.refined.overlapped ${seqXName}-${seqYName}.refined.notOverlapped ${seqXName}-${seqYName}.clasified.master ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.IR

mv ${seqXName}-${seqYName}.refined.notOverlapped ../../csb
mv ${seqXName}-${seqYName}.TR ../../csb
mv ${seqXName}-${seqYName}.IR ../../csb
mv ${seqXName}-${seqYName}.clasified.master ../../csb
mv ${seqXName}-${seqYName}.refined.overlapped ../../csb
mv ${seqXName}-${seqYName}.refined.notOverlapped ../../csb


echo "Deleting the tmp folder: ${seqXName}-${seqYName}"
cd ..

#rm -rf ${seqXName}-${seqYName}
#rm -r ../intermediateFiles
rm -r ../intermediateFiles/${seqXName}-${seqYName}.v3.frags
rm -r ../intermediateFiles/${seqXName}-${seqYName}.joined
rm -r ../intermediateFiles/${seqXName}-${seqYName}.evol.frag2
rm -r ../intermediateFiles/${seqXName}-${seqYName}.evol.csb2

}
#&> log.txt
