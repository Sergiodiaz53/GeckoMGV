#!/bin/bash

FL=1000   # frequency limit
MG=0
igap=100
egap=1
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

mkdir fastaRever
mkdir intermediateFiles

mkdir intermediateFiles/${seqXName}-${seqYName}
mkdir results
mkdir intermediateFiles/dictionaries
mkdir intermediateFiles/hits

mkdir csv
mkdir csb
mkdir comparaciones



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

#Borramos todo menos los frags y los diccionarios

#exit 0
#### CSB Workflow

if [ $MG == 0 ]; then

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
	echo " --------------------------------------"
	
	#rm -rf ${seqXName}.karpar
		
	echo "--------- frags to master ----------"
	## frags to master
	echo "${BINDIR}/fragstoMaster ${seqXName}-${seqYName}.fil.frags ${seqXName}-${seqYName}.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}"
	${BINDIR}/fragstoMaster ${seqXName}-${seqYName}.fil.frags ${seqXName}-${seqYName}.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}
	
	echo "${BINDIR}/fragstoMaster ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.original.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}"
	${BINDIR}/fragstoMaster ${seqXName}-${seqYName}.frags ${seqXName}-${seqYName}.original.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}
	
	echo "-------------------------------------"

	## Ahora ya trabajamos con master. CSB.

	echo "----------- evolution CSB --------------"	
	
#	exit 0

	# connect fragments up
	echo " ${BINDIR}/connectFragsUp ${seqXName}-${seqYName}.master ${seqXName}-${seqYName}.newMaster "
	${BINDIR}/connectFragsUp ${seqXName}-${seqYName}.master ${seqXName}-${seqYName}.new.Master	

	# Extract Overlapped
        echo " ${BINDIR}/extractOverlapped ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.NO $igap $egap ${seqXName}-${seqYName}.O"
        ${BINDIR}/extractOverlapped ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.NO $igap $egap ${seqXName}-${seqYName}.O

	# Refine overlapped
	echo " ${BINDIR}/refineOverlapped ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.O ${seqXName}-${seqYName}.NO ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.newO ${seqXName}-${seqYName}.newNO"
	${BINDIR}/refineOverlapped ${seqXName}-${seqYName}.new.Master ${seqXName}-${seqYName}.O ${seqXName}-${seqYName}.NO ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.newO ${seqXName}-${seqYName}.newNO


	# Clasiffy Repeats
	echo "${BINDIR}/clasifyRepeats ${seqXName}-${seqYName}.newO ${seqXName}-${seqYName}.newNO ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.finalNO"
	${BINDIR}/clasifyRepeats ${seqXName}-${seqYName}.newO ${seqXName}-${seqYName}.newNO ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.finalNO

	# Refine TR (De momento no refinamos)
	echo "${BINDIR}/refineTandemRepeats ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.TR.refined"
#	${BINDIR}/refineTandemRepeats ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.TR.refined

	# Refine IR (De momento no refinamos)
	echo "${BINDIR}/refineIR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.Dup"
##	${BINDIR}/refineIR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.Dup

	# JOIN csb
	#echo "${BINDIR}/joinCSB ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.csb $igap $egap"
	#${BINDIR}/joinCSB ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.csb $igap $egap
	
	# Prueba de JOIN
	echo "${BINDIR}/joinCSBwithIR ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.csb $igap $egap"
	${BINDIR}/joinCSBwithIR ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.csb $igap $egap
echo " ------------------------------------------------------------------------------------------------------------------------------------"

	#exit 0 
	
	echo "------------ progressive mauve ---------"
	echo "~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ${seqXName}.${extensionX} ${seqYName}.${extensionY}"
#	~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ${seqXName}.${extensionX} ${seqYName}.${extensionY}

	echo "------------ GRIMM ---------"
	#Paso a anchor
	echo "${BINDIR}/frags2GRIMM ${seqXName}-${seqYName}.fil.frags GRIMM/${seqXName}-${seqYName}.anchor "
#	${BINDIR}/frags2GRIMM ${seqXName}-${seqYName}.fil.frags GRIMM/${seqXName}-${seqYName}.anchor 
	echo "~/programs/GRIMM_SYNTENY-2.02/grimm_synt -A -c -f GRIMM/${seqXName}-${seqYName}.anchor -d GRIMM/anchor"
#	~/programs/GRIMM_SYNTENY-2.02/grimm_synt -A -c -f GRIMM/${seqXName}-${seqYName}.anchor -d GRIMM/anchor
	echo "${BINDIR}/fromGRIMM2csb ${seqXName}-${seqYName}.fil.frags GRIMM/anchor/unique_coords.txt ${seqXName}-${seqYName}.GRIMM.master"
#	${BINDIR}/fromGRIMM2csb ${seqXName}-${seqYName}.fil.frags GRIMM/anchor/unique_coords.txt ${seqXName}-${seqYName}.GRIMM.master
	
	
	
	echo "------------- paso a csb-------------"
#	${BINDIR}/fromMauve2CSB ${seqXName}-${seqYName}.mauve.backbone ${seqXName}-${seqYName}.mauve.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}
	
	
	echo "------------- compara -------------"
#	${BINDIR}/compareTwoCSBfiles ${seqXName}-${seqYName}.mauve.master ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.TR.refined ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} 10 1 ${BINDIR}/matrix.mat 0 ${seqXName}-${seqYName}.salida > ${seqXName}-${seqYName}-mauve.comp
#	${BINDIR}/compareTwoCSBfiles ${seqXName}-${seqYName}.GRIMM.master ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.TR.refined ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} 10 1 ${BINDIR}/matrix.mat 0 ${seqXName}-${seqYName}.salida > ${seqXName}-${seqYName}-GRIMM.comp
	
	
	echo "----------- csv --------------"
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.csb.csv.tmp"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.csb.csv.tmp
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master > ${seqXName}-${seqYName}.original.csv.tmp"
#	${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master > ${seqXName}-${seqYName}.original.csv.tmp
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.TR.csv.tmp"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.TR.csv.tmp
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.IR.csv.tmp"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.IR.csv.tmp
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.DUP.csv.tmp"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.newMaster > ${seqXName}-${seqYName}.DUP.csv.tmp
	
	
	cp ${seqXName}-${seqYName}.frags.INF ${seqXName}-${seqYName}.inf

	echo "cat files"	
	cat ${seqXName}-${seqYName}.inf ${seqXName}-${seqYName}.csb.csv.tmp > ${seqXName}-${seqYName}.csb.csv
	cat ${seqXName}-${seqYName}.inf ${seqXName}-${seqYName}.TR.csv.tmp > ${seqXName}-${seqYName}.TR.csv
	cat ${seqXName}-${seqYName}.inf ${seqXName}-${seqYName}.IR.csv.tmp > ${seqXName}-${seqYName}.IR.csv
	cat ${seqXName}-${seqYName}.inf ${seqXName}-${seqYName}.DUP.csv.tmp > ${seqXName}-${seqYName}.DUP.csv
	
	
	#rm -rf ${seqXName}-${seqYName}.csv.tmp
	#rm -rf ${seqXName}-${seqYName}.mauve.tmp
	#rm -rf ${seqXName}-${seqYName}.repeats.tmp
	echo " --------------------------------------"	
	
	
	
	
	
	#rm -rf ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.csb.txt ${seqXName}-${seqYName}-getCSBlog.txt ${seqXName}-${seqYName}.csb.frag.txt ${seqXName}-${seqYName}-fragv3tov2log.txt
	
	#if [[ -L "../../${seqXName}.fasta" ]]
	#then
	#	rm ../../${seqXName}.fasta
	#fi	

	#if [[ -L "../../${seqYName}.fasta" ]]
	#then
	#	rm ../../${seqYName}.fasta
	#fi
	

	

	
fi
#Movemos los frags y los info
mv ${seqXName}-${seqYName}.IR ../../csb
mv ${seqXName}-${seqYName}.TR ../../csb
mv ${seqXName}-${seqYName}.DUP ../../csb
mv ${seqXName}-${seqYName}.csb ../../csb
mv ${seqXName}-${seqYName}.newMaster ../../csb

mv ${seqXName}-${seqYName}.IR.csv ../../csv
mv ${seqXName}-${seqYName}.TR.csv ../../csv
mv ${seqXName}-${seqYName}.DUP.csv ../../csv
mv ${seqXName}-${seqYName}.csb.csv ../../csv

mv ${seqXName}-${seqYName}.fil.frags ../../results
mv ${seqXName}-${seqYName}.frags ../../results
mv ${seqXName}-${seqYName}.frags.INF ../../results
mv ${seqXName}-${seqYName}.frags.MAT ../../results

mv ${seqYName}-revercomp.${extensionY}  ../../fastaRever


echo "Deleting the tmp folder: ${seqXName}-${seqYName}"
cd ..

	rm -rf ${seqXName}-${seqYName}


#rm -r ../intermediateFiles

}
#&> log.txt
