#!/usr/bin/env bash
DIRFASTA1=$1
DIRFASTA2=$2
DIRREVER=$3
EXTFASTA=$4

DIRCSB=$5

iGAP=$6
eGAP=$7

MATRIX=$8
OUTPUTDIR=$9
CRO=${10}

array=()
array2=()
x=0
y=0

if [ $# != 10 ]; then
	echo "***ERROR*** Use: $0 dirFasta1 dirFasta2 dirReverComp extFasta dirCSB iGAP eGAP matrix outputDir Cromosomes(0: allVsAll 1: folder1 vs folder2) "
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
			echo "----------${seqX}-${seqY}-- Align ---------"
			
# alignCSBs ../csbAnnotated/Dm-2L-Ds-W501-2L.csb.ann.MASTER ../csbAnnotated/Dm-2L-Ds-W501-2L.csb.ann.CSB ../../fasta/Dm/Dm-2L.fasta ../../fasta/Ds/Ds-W501-2L.fasta ../fastaRever/Ds-W501-2L-revercomp.fasta 100 1 ~/SVN/LNCCInstallation/HSPandCSB/bin/matrix.mat masterOut csbOut
			echo "${BINDIR}/alignCSBs ${DIRCSB}/${seqX}-${seqY}.csb.ann.MASTER ${DIRCSB}/${seqX}-${seqY}.csb.ann.CSB ${DIRFASTA1}/${seqX}.${EXTFASTA} ${DIRFASTA2}/${seqY}.${EXTFASTA} ${DIRREVER}/${seqY}-revercomp.${EXTFASTA} ${iGAP} ${eGAP} ${MATRIX} ${OUTPUTDIR}/${seqX}-${seqY}.csb.ann.alig.MASTER ${OUTPUTDIR}/${seqX}-${seqY}.csb.ann.alig.CSB"
		done
	done
fi

## Todos ocntra todos. Un solo cromosoma por especie
if [[ ${CRO} == 0 ]]; then
	for ((i=0 ; i < ${#array[@]} ; i++))
	do
		for ((j=$i ; j < ${#array2[@]} ; j++))
		do
			if [[ $i!=$j ]]; then	
				seqX=${array[$i]}
				seqY=${array2[$j]}
				echo "----------${seqX}-${seqY}-- GENE ---------"

			fi
		done
	done
fi
