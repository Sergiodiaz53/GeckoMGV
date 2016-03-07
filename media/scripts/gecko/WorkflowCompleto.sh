#!/bin/bash

FL=1000   # frequency limit
MG=0
igap=100
egap=1
if [ $# -lt 11 ]; then
   echo " ==== ERROR ... you called this script inappropriately."
   echo ""
   echo "   usage:  $0 seqXName seqYName annDIR annEXT lenght similarity WL fixedL iGAP eGAP MAT"
   echo ""
   exit -1
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

annDIR=${3}
annEXT=${4}

length=${5}
similarity=${6}
WL=${7} # wordSize
fixedL=${8}

iGAP=${9}
eGAP=${10}
MAT=${11}



mkdir fastaRever
mkdir intermediateFiles

mkdir intermediateFiles/${seqXName}-${seqYName}
mkdir results
mkdir intermediateFiles/dictionaries
mkdir intermediateFiles/hits
mkdir intermediateFiles/gene


mkdir csv
mkdir csvAnn
mkdir csb
mkdir csbAnn
mkdir csbAlign


# Copiamos los fastas
ln -s ${dirNameX}/${seqXName}.${extensionX} intermediateFiles/${seqXName}-${seqYName}
ln -s ${dirNameY}/${seqYName}.${extensionY} intermediateFiles/${seqXName}-${seqYName}

cd intermediateFiles/${seqXName}-${seqYName}
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

# Lanzamos comparaciones
echo "${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${length} ${similarity} ${WL} ${fixedL} f &"
${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${length} ${similarity} ${WL} ${fixedL} f &

echo "${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}-revercomp.${extensionY} ${length} ${similarity} ${WL} ${fixedL} r &"
${BINDIR}/comparison.sh ${seqXName}.${extensionX} ${seqYName}-revercomp.${extensionY} ${length} ${similarity} ${WL} ${fixedL} r &

# Esperamos a que terminen
echo "Waiting for the comparisons"

for job in `jobs -p`
do
    #echo $job
    wait $job
done

# Combinamos fragmentos
echo "${BINDIR}/combineFrags ${seqXName}-${seqYName}-sf.frags ${seqXName}-${seqYName}-revercomp-sr.frags ${seqXName}-${seqYName}.frags"
${BINDIR}/combineFrags ${seqXName}-${seqYName}-sf.frags ${seqXName}-${seqYName}-revercomp-sr.frags ${seqXName}-${seqYName}.frags

#Borramos todo menos los frags y los diccionarios

#### CSB Workflow


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
#	echo "${BINDIR}/refineTandemRepeats ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.TR.refined"
#	${BINDIR}/refineTandemRepeats ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.TR.refined

	# Refine IR (De momento no refinamos)
#	echo "${BINDIR}/refineIR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.Dup"
##	${BINDIR}/refineIR ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.Dup

	# JOIN csb
	#echo "${BINDIR}/joinCSB ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.csb $igap $egap"
	#${BINDIR}/joinCSB ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.csb $igap $egap
	
	# Prueba de JOIN
	echo "${BINDIR}/joinCSBwithIR ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.csb $igap $egap"
	${BINDIR}/joinCSBwithIR ${seqXName}-${seqYName}.newMaster ${seqXName}-${seqYName}.finalNO ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.csb $igap $egap
echo " ------------------------------------------------------------------------------------------------------------------------------------"

	
#	echo "------------ progressive mauve ---------"
#	echo "~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ${seqXName}.${extensionX} ${seqYName}.${extensionY}"
#	~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${seqXName}-${seqYName}.mauve ${seqXName}.${extensionX} ${seqYName}.${extensionY}

#	echo "------------ GRIMM ---------"
	#Paso a anchor
#	echo "${BINDIR}/frags2GRIMM ${seqXName}-${seqYName}.fil.frags GRIMM/${seqXName}-${seqYName}.anchor "
#	${BINDIR}/frags2GRIMM ${seqXName}-${seqYName}.fil.frags GRIMM/${seqXName}-${seqYName}.anchor 
#	echo "~/programs/GRIMM_SYNTENY-2.02/grimm_synt -A -c -f GRIMM/${seqXName}-${seqYName}.anchor -d GRIMM/anchor"
#	~/programs/GRIMM_SYNTENY-2.02/grimm_synt -A -c -f GRIMM/${seqXName}-${seqYName}.anchor -d GRIMM/anchor
#	echo "${BINDIR}/fromGRIMM2csb ${seqXName}-${seqYName}.fil.frags GRIMM/anchor/unique_coords.txt ${seqXName}-${seqYName}.GRIMM.master"
#	${BINDIR}/fromGRIMM2csb ${seqXName}-${seqYName}.fil.frags GRIMM/anchor/unique_coords.txt ${seqXName}-${seqYName}.GRIMM.master
#	echo "------------- paso a csb-------------"
#	${BINDIR}/fromMauve2CSB ${seqXName}-${seqYName}.mauve.backbone ${seqXName}-${seqYName}.mauve.master ${seqXName}.${extensionX} ${seqYName}.${extensionY}
	
	
#	echo "------------- compara -------------"
#	${BINDIR}/compareTwoCSBfiles ${seqXName}-${seqYName}.mauve.master ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.TR.refined ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} 10 1 ${BINDIR}/matrix.mat 0 ${seqXName}-${seqYName}.salida > ${seqXName}-${seqYName}-mauve.comp
#	${BINDIR}/compareTwoCSBfiles ${seqXName}-${seqYName}.GRIMM.master ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.IR.refined ${seqXName}-${seqYName}.TR.refined ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} 10 1 ${BINDIR}/matrix.mat 0 ${seqXName}-${seqYName}.salida > ${seqXName}-${seqYName}-GRIMM.comp
	
	
	echo "----------- csv --------------"
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.csb.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.csb.csv
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.original.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.original.csv
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.TR.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.TR.csv
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.IR.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.IR.csv
	
	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.DUP.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP ${seqXName}-${seqYName}.newMaster 0 ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.DUP.csv
	echo " --------------------------------------"	




	# ANNOTATE 
# ANNOTATE
         echo "----------${seqXName}-${seqYName}-- GENE ---------"
         if [[ ! -f ../gene/${seqXName}.gene} ]];  then

                echo "${BINDIR}/WritePTT_FAAfromGBK.pl ../../${annDIR}/${seqXName}.${annEXT} ${seqXName}"
                ${BINDIR}/WritePTT_FAAfromGBK.pl ../../${annDIR}/${seqXName}.${annEXT} ${seqXName}
                echo "${BINDIR}/parseGeneBankTab ${seqXName}.ptt ${seqXName}.gene ${seqXName}.gene.csv "
                ${BINDIR}/parseGeneBankTab ${seqXName}.ptt ${seqXName}.gene ${seqXName}.gene.csv
                rm ${seqXName}.ptt
		mv ${seqXName}.gene ../gene/
		mv ${seqXName}.gene.csv ../gene/

        fi
        if [[ ! -f ../gene/${seqYName}.gene} ]];    then

                echo "${BINDIR}/WritePTT_FAAfromGBK.pl ../../${annDIR}/${seqYName}.${annEXT} ${seqYName}"
                ${BINDIR}/WritePTT_FAAfromGBK.pl ../../${annDIR}/${seqYName}.${annEXT} ${seqYName}
                echo "${BINDIR}/parseGeneBankTab ${seqYName}.ptt ${seqYName}.gene ${seqYName}.gene.csv "
                ${BINDIR}/parseGeneBankTab ${seqYName}.ptt ${seqYName}.gene ${seqYName}.gene.csv
                rm ${seqYName}.ptt
		mv ${seqYName}.gene ../gene/
		mv ${seqYName}.gene.csv ../gene/
        fi
        echo " -------- ANNOTATE CSB ------ "
        # anotamos todas las extensiones
        ###### CSB
	
	echo "${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.csb ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.csb.ann.MASTER ${seqXName}-${seqYName}.csb.ann.CSB  "
        ${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.csb ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.csb.ann.MASTER ${seqXName}-${seqYName}.csb.ann.CSB

        ##### IR
        echo "${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.IR ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.IR.ann.MASTER ${seqXName}-${seqYName}.IR.ann.CSB  "
        ${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.IR ${annDIRT}/${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.IR.ann.MASTER ${seqXName}-${seqYName}.IR.ann.CSB

        ##### TR
        echo "${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.TR ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.TR.ann.MASTER ${seqXName}-${seqYName}.TR.ann.CSB  "
        ${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.TR ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.TR.ann.MASTER ${seqXName}-${seqYName}.TR.ann.CSB

        ##### DUP
        echo "${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.DUP ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.DUP.ann.MASTER ${seqXName}-${seqYName}.DUP.ann.CSB  "
        ${BINDIR}/annotateCSBs ${seqXName}-${seqYName}.DUP ../gene//${seqXName}.gene ../gene//${seqYName}.gene 100 1 ${seqXName}-${seqYName}.DUP.ann.MASTER ${seqXName}-${seqYName}.DUP.ann.CSB

	echo "------ ALINEADO ------"
# time sbatch ${BINDIR}/ejecutarPicasso.sh ${seqX}-${seqY}.log  ${BINDIR}/WorkflowCompleto.sh
	#  ./alignCSBs Master CSBs fastaX fastaY fastaY-rever iGap eGap matfile MasterOut CSBsOut

	echo "time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.csb.ann.MASTER ${seqXName}-${seqYName}.csb.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.csb.ann.align.MASTER ${seqXName}-${seqYName}.csb.ann.align.CSB &"
	time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.csb.ann.MASTER ${seqXName}-${seqYName}.csb.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.csb.ann.align.MASTER ${seqXName}-${seqYName}.csb.ann.align.CSB &

	echo "time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.IR.ann.MASTER ${seqXName}-${seqYName}.IR.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.IR.ann.align.MASTER ${seqXName}-${seqYName}.IR.ann.align.CSB &"
        time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.IR.ann.MASTER ${seqXName}-${seqYName}.IR.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.IR.ann.align.MASTER ${seqXName}-${seqYName}.IR.ann.align.CSB &

	echo "time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.TR.ann.MASTER ${seqXName}-${seqYName}.TR.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.TR.ann.align.MASTER ${seqXName}-${seqYName}.TR.ann.align.CSB &"
        time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.TR.ann.MASTER ${seqXName}-${seqYName}.TR.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.TR.ann.align.MASTER ${seqXName}-${seqYName}.TR.ann.align.CSB &

	echo "time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.DUP.ann.MASTER ${seqXName}-${seqYName}.DUP.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.DUP.ann.align.MASTER ${seqXName}-${seqYName}.DUP.ann.align.CSB &"
        time ${BINDIR}/alignCSBs ${seqXName}-${seqYName}.DUP.ann.MASTER ${seqXName}-${seqYName}.DUP.ann.CSB ${seqXName}.${extensionX} ${seqYName}.${extensionY} ${seqYName}-revercomp.${extensionY} $iGAP $eGAP $MAT ${seqXName}-${seqYName}.DUP.ann.align.MASTER ${seqXName}-${seqYName}.DUP.ann.align.CSB &
	
echo "Waiting for the Alignment"

for job in `jobs -p`
do
    #echo $job
    wait $job
done


	echo "---------------- CSV --------------------"

	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb.ann.align.CSB ${seqXName}-${seqYName}.csb.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.csb.ann.align.csv"
        ${BINDIR}/csb2csv ${seqXName}-${seqYName}.csb.ann.align.CSB ${seqXName}-${seqYName}.csb.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.csb.ann.align.csv

	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR.ann.align.CSB ${seqXName}-${seqYName}.TR.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.TR.ann.align.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.TR.ann.align.CSB ${seqXName}-${seqYName}.TR.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.TR.ann.align.csv

	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR.ann.align.CSB ${seqXName}-${seqYName}.IR.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.IR.ann.align.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.IR.ann.align.CSB ${seqXName}-${seqYName}.IR.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.IR.ann.align.csv

	echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP.ann.align.CSB ${seqXName}-${seqYName}.DUP.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.DUP.ann.align.csv"
	${BINDIR}/csb2csv ${seqXName}-${seqYName}.DUP.ann.align.CSB ${seqXName}-${seqYName}.DUP.ann.align.MASTER ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} ../gene/${seqYName}.gene ../gene/${seqYName}.gene > ${seqXName}-${seqYName}.DUP.ann.align.csv




        echo "${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.original.csv"
        ${BINDIR}/csb2csv ${seqXName}-${seqYName}.original.master ${seqXName}-${seqYName}.original.master ${seqXName}.${extensionX} ${seqXName} ${seqYName}.${extensionY} ${seqYName} > ${seqXName}-${seqYName}.original.csv

        
	echo " --------------------------------------"



	
# END	
#Movemos los frags y los info
mv ${seqXName}-${seqYName}.IR ../../csb
mv ${seqXName}-${seqYName}.TR ../../csb
mv ${seqXName}-${seqYName}.DUP ../../csb
mv ${seqXName}-${seqYName}.csb ../../csb
mv ${seqXName}-${seqYName}.newMaster ../../csb

mv ${seqXName}-${seqYName}.*.ann.align.csv ../../csvAnn
mv ${seqXName}-${seqYName}.*.ann.align.* ../../csbAlign
mv ${seqXName}-${seqYName}.*.ann.* ../../csbAnn


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



}
#&> log.txt
