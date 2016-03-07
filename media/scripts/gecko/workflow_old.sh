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

dirNameX=$(readlink -f $1 | xargs dirname)
seqXName=$(basename "$1")
extensionX="${seqXName##*.}"
seqXName="${seqXName%.*}"

dirNameY=$(readlink -f $2 | xargs dirname)
seqYName=$(basename "$2")
extensionY="${seqYName##*.}"
seqYName="${seqYName%.*}"

#seqXName=`basename $1 .fasta`
#seqYName=`basename $2 .fasta`

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

length=${3}
similarity=${4}
WL=${5} # wordSize
fixedL=${6}

mkdir intermediateFiles

mkdir intermediateFiles/${seqXName}-${seqYName}
mkdir results
mkdir intermediateFiles/dictionaries
mkdir intermediateFiles/hits

# Copiamos los fastas
ln -s ${dirNameX}/${seqXName}.${extensionX} intermediateFiles/${seqXName}-${seqYName}
ln -s ${dirNameY}/${seqYName}.${extensionY} intermediateFiles/${seqXName}-${seqYName}

cd intermediateFiles/${seqXName}-${seqYName}

###############


echo "${BINDIR}/reverseComplement ${seqYName}.${extensionX} ${seqYName}-revercomp.${extensionY}"
${BINDIR}/reverseComplement ${seqYName}.${extensionX} ${seqYName}-revercomp.${extensionY}

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

#Borramos todo menos los frags y los diccionarios


#### CSB Workflow

if [ $MG == 0 ]; then

	# Calc ACGT frequencies
	echo "${BINDIR}/getFreqFasta ${seqXName}.${extensionX} ${seqXName}.freq"
	${BINDIR}/getFreqFasta ${seqXName}.${extensionX} ${seqXName}.freq
	
	#Calc karlin parameters
	echo "${BINDIR}/kar2test ${seqXName}.freq ${BINDIR}/matrix.mat 1 ${seqXName}.karpar"	
	${BINDIR}/kar2test ${seqXName}.freq ${BINDIR}/matrix.mat 1 ${seqXName}.karpar

	#rm -rf ${seqXName}.freq
	
	# Change to internal structure of fragments and filtering by p-value
	echo "${BINDIR}/fragv2tov3 ${seqXName}-${seqYName}.frags ${seqXName}.karpar ${seqXName}-${seqYName}.v3.frags ${seqXName}-${seqYName}.v3.txt"
	${BINDIR}/fragv2tov3 ${seqXName}-${seqYName}.frags ${seqXName}.karpar ${seqXName}-${seqYName}.v3.frags ${seqXName}-${seqYName}.v3.txt	
	
	#rm -rf ${seqXName}.karpar

	# Filter by duplications

	# Get Malla
	echo "${BINDIR}/getMalla ${seqXName}-${seqYName}.v3.frags ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.dup > ${seqXName}-${seqYName}-filtroDuplog.txt"
	${BINDIR}/getMalla ${seqXName}-${seqYName}.v3.frags ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.dup > ${seqXName}-${seqYName}-filtroDuplog.txt


	#rm -rf ${seqXName}-${seqYName}.v3.frags

	# Get CSB
	echo "${BINDIR}/getDuplicatedCSB ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.txt > ${seqXName}-${seqYName}-getCSBlog.txt" 
	${BINDIR}/getDuplicatedCSB ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.fil.csb ${seqXName}-${seqYName}.csb.txt > ${seqXName}-${seqYName}-getCSBlog.txt

	
	echo "${BINDIR}/getCSB ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.txt > ${seqXName}-${seqYName}-getCSBlog.txt" 
	${BINDIR}/getCSB ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.txt > ${seqXName}-${seqYName}-getCSBlog.txt

	#rm -rf ${seqXName}-${seqYName}.fil ${seqXName}-${seqYName}.dup ${seqXName}-${seqYName}-filtroDuplog.txt
	# Change to fragment format
	echo "${BINDIR}/fragv3tov2 ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.frags ${seqXName}-${seqYName}.csb.frag.txt > ${seqXName}-${seqYName}-fragv3tov2log.txt"
	${BINDIR}/fragv3tov2 ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.frags ${seqXName}-${seqYName}.csb.frag.txt > ${seqXName}-${seqYName}-fragv3tov2log.txt

	
#	echo "${BINDIR}/fragv3tov2 ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.frags ${seqXName}-${seqYName}.csb.frag.txt > ${seqXName}-${seqYName}-fragv3tov2log.txt"
#	${BINDIR}/fragv3tov2 ${seqXName}-${seqYName}.v3.frags ${seqXName}-${seqYName}.csb.frags ${seqXName}-${seqYName}.csb.frag.txt > ${seqXName}-${seqYName}-fragv3tov2log.txt

	
	
	# Get Info from frags 
	cp ${seqXName}-${seqYName}.frags.INF ${seqXName}-${seqYName}.csb.frags.INF
	echo "${BINDIR}/getInfo ${seqXName}-${seqYName}.csb.frags 1 > ${seqXName}-${seqYName}.csv"
	${BINDIR}/getInfo ${seqXName}-${seqYName}.csb.frags 1 ${seqXName} ${seqYName} ${seqXName}-${seqYName} > ${seqXName}-${seqYName}.csv.tmp
	cat ${seqXName}-${seqYName}.csb.frags.INF ${seqXName}-${seqYName}.csv.tmp > ${seqXName}-${seqYName}.csv
	#rm -rf ${seqXName}-${seqYName}.csv.tmp
	
	#rm -rf ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.txt ${seqXName}-${seqYName}-getCSBlog.txt ${seqXName}-${seqYName}.csb.frag.txt ${seqXName}-${seqYName}-fragv3tov2log.txt
	
	#if [[ -L "../../${seqXName}.fasta" ]]
	#then
	#	rm ../../${seqXName}.fasta
	#fi	

	#if [[ -L "../../${seqYName}.fasta" ]]
	#then
	#	rm ../../${seqYName}.fasta
	#fi

	mv ${seqXName}-${seqYName}.csb.frags.INF ../../results
	mv ${seqXName}-${seqYName}.csb.frags ../../results
	mv ${seqXName}-${seqYName}.csv ../../results
fi

#Movemos los frags y los info
mv ${seqXName}-${seqYName}.frags ../../results
mv ${seqXName}-${seqYName}.frags.INF ../../results
mv ${seqXName}-${seqYName}.frags.MAT ../../results

echo "Deleting the tmp folder: ${seqXName}-${seqYName}"
cd ..

rm -rf ${seqXName}-${seqYName}

} #&> /dev/null
