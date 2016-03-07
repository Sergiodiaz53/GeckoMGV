#!/usr/bin/env bash
DIRFASTA1=$1
DIRFASTA2=$2
EXTFASTA=$3


DIRGFF1=$4
DIRGFF2=$5
EXTGFF=$6
DIROUT=$7

DIRCSB=$8
DIROUTCSB=$9

CRO=${10}
FILE=${11}

array=()
array2=()
x=0
y=0

if [ $# != 11 ]; then
	echo "***ERROR*** Use: $0 chrDir_1 chrDir_2 chr_ext annDir_1 annDir_2 ann_ext annDir_out csbDir csbDir_out cromosomas(0: allVsall 1: folder1Vsfolder2) file (0: gecko, 1:mauve)"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for elem in $(ls -d $DIRFASTA1/*.$EXTFASTA | awk -F "/" '{print $NF}' | awk -F ".$EXTFASTA" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	echo "X: $elem"
done

for elem in $(ls -d $DIRFASTA2/*.$EXTFASTA | awk -F "/" '{print $NF}' | awk -F ".$EXTFASTA" '{print $1}')
do
        array2[$y]=$elem
        y=`expr $y + 1`
        echo "Y: $elem"
done

## Una carpeta contra otra. Cromosomas
if [[ ${CRO} == 1 ]]; then
	for ((i=0 ; i < ${#array[@]} ; i++))
	do
		for ((j=0 ; j < ${#array2[@]} ; j++))
		do
				seqX=${array[$i]}
				seqY=${array2[$j]}
				echo "----------${seqX}-${seqY}-- GENE ---------"
				if [[ ! -f ${DIROUT}/${seqX}.gene} ]];	then
					
					echo "${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF1}/${seqX}.${EXTGFF} ${seqX}"
					${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF1}/${seqX}.${EXTGFF} ${seqX}
					echo "${BINDIR}/parseGeneBankTab ${seqX}.ptt ${DIROUT}/${seqX}.gene ${DIROUT}/${seqX}.csv "
					${BINDIR}/parseGeneBankTab ${seqX}.ptt ${DIROUT}/${seqX}.gene ${DIROUT}/${seqX}.csv 
					rm ${seqX}.ptt
				
				fi
				if [[ ! -f ${DIROUT}/${seqY}.gene} ]];    then

									echo "${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF2}/${seqY}.${EXTGFF} ${seqY}"
									${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF2}/${seqY}.${EXTGFF} ${seqY}
					echo "${BINDIR}/parseGeneBankTab ${seqY}.ptt ${DIROUT}/${seqY}.gene ${DIROUT}/${seqY}.csv "
					${BINDIR}/parseGeneBankTab ${seqY}.ptt ${DIROUT}/${seqY}.gene ${DIROUT}/${seqY}.csv
					rm ${seqY}.ptt
							fi
				echo " -------- ANNOTATE CSB ------ "
		
				# anotamos todas las extensiones

				###### CSB
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.CSB  " 
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.CSB		
				

				##### IR
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.IR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.IR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.CSB 
				
				##### TR
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.TR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.TR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.CSB  

				##### DUP

				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.DUP ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.DUP ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.CSB

		done
	done
fi

## Todos ocntra todos. Un solo cromosoma por especie
if [[ ${CRO} == 0 ]]; then
	for ((i=0 ; i < ${#array[@]} ; i++))
	 #for ((i=0 ; i < 3 ; i++))
	do
		for ((j=$i ; j < ${#array2[@]} ; j++))
		#for ((j=$i ; j < 3 ; j++))
		do
			if [ $i != $j ]; then	
				seqX=${array[$i]}
				seqY=${array2[$j]}
				echo "----------${seqX}-${seqY}-- GENE ---------"
				if [[ ! -f ${DIROUT}/${seqX}.gene ]];	then
					
					echo "${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF1}/${seqX}.${EXTGFF} ${seqX}"
					${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF1}/${seqX}.${EXTGFF} ${seqX}
					echo "${BINDIR}/parseGeneBankTab ${seqX}.ptt ${DIROUT}/${seqX}.gene ${DIROUT}/${seqX}.csv "
					${BINDIR}/parseGeneBankTab ${seqX}.ptt ${DIROUT}/${seqX}.gene ${DIROUT}/${seqX}.csv 
				#	rm ${seqX}.ptt
				
				fi
				if [[ ! -f ${DIROUT}/${seqY}.gene ]];    then

					echo "${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF2}/${seqY}.${EXTGFF} ${seqY}"
					${BINDIR}/WritePTT_FAAfromGBK.pl ${DIRGFF2}/${seqY}.${EXTGFF} ${seqY}
					echo "${BINDIR}/parseGeneBankTab ${seqY}.ptt ${DIROUT}/${seqY}.gene ${DIROUT}/${seqY}.csv "
					${BINDIR}/parseGeneBankTab ${seqY}.ptt ${DIROUT}/${seqY}.gene ${DIROUT}/${seqY}.csv
				#	rm ${seqY}.ptt
				fi
				echo " -------- ANNOTATE CSB ------ "
		
				# anotamos todas las extensiones

				if [[ ${FILE} == 0 ]]; then # Gecko
				###### CSB
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.CSB  " 
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.csb.ann.CSB		
				

				##### IR
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.IR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.IR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.IR.ann.CSB 
				
				##### TR
				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.TR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.TR ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.TR.ann.CSB  

				##### DUP

				echo "${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.DUP ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.CSB  "
				${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.DUP ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.DUP.ann.CSB

				fi

				if [[ ${FILE} == 1 ]]; then # mauve
				
					echo " ${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.mauve.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.mauve.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.mauve.ann.CSB"
					${BINDIR}/annotateCSBsv2 ${DIRCSB}/${seqX}-${seqY}.mauve.csb ${DIROUT}/${seqX}.gene ${DIROUT}/${seqY}.gene 100 1 ${DIROUTCSB}/${seqX}-${seqY}.mauve.ann.MASTER ${DIROUTCSB}/${seqX}-${seqY}.mauve.ann.CSB
				fi
			fi
		done
	done
fi
