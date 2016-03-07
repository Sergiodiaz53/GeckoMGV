#!/usr/bin/env bash
DIR1=$1
DIR2=$2
DIRREVER=$3
EXT=$4
CRO=$5

COMP1=$6
EXT1=$7
COMP2=$8

iGAP=$9
eGAP=${10}
MAT=${11}




array=()
array2=()
x=0
y=0

if [ $# != 11 ]; then
	echo "***ERROR*** Use: $0 dirFasta1 dirFasta2 dirRever ext Crom ( 0: allVsall 1: folder1 vs folder2) COMP1Folder EXT1 CompGeckoFolder iGAP eGAP MAT"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for elem in $(ls -d $DIR1/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	echo "X: $elem"
done

for elem in $(ls -d $DIR2/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
        array2[$y]=$elem
        y=`expr $y + 1`
        echo "Y: $elem"
done


if [[ ${CRO} == 1 ]]; then # folder 1 vs folder 2
for ((i=0 ; i < ${#array[@]} ; i++))
#for ((i=0 ; i < 1 ; i++))
do
	for ((j=0 ; j < ${#array2[@]} ; j++))
	do
				seqX=${array[$i]}
				seqY=${array2[$j]}
			#	echo "----------${seqX}-${seqY}-----------"
			#	echo "${BINDIR}/compareTwoCSBfiles ${COMP1}/${seqX}-${seqY}.${EXT1}.alg.master ${COMP2}/${seqX}-${seqY}.alg.csb.master ${COMP2}/${seqX}-${seqY}.alg.IR.master ${COMP2}/${seqX}-${seqY}.alg.TR.master ${COMP2}/${seqX}-${seqY}.alg.DUP.master ${seqX}-${seqY} hola"
                               ${BINDIR}/compareTwoCSBfiles ${COMP1}/${seqX}-${seqY}.${EXT1}.alg.master ${COMP2}/${seqX}-${seqY}.alg.csb.master ${COMP2}/${seqX}-${seqY}.alg.IR.master ${COMP2}/${seqX}-${seqY}.alg.TR.master ${COMP2}/${seqX}-${seqY}.alg.DUP.master ${seqX}-${seqY} ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} ${DIRREVER}/${seqY}-revercomp.${EXT} ${iGAP} ${eGAP} ${MAT} hola
	done
done
fi



if [[ ${CRO} == 0 ]];then # All vs all

for ((i=0 ; i < ${#array[@]} ; i++))
#for ((i=0 ; i < 1 ; i++))
do
        for ((j=$i ; j < ${#array2[@]} ; j++))
        do
                if [ $i != $j ]; then
                                seqX=${array[$i]}
                                seqY=${array2[$j]}
                               # echo "----------${seqX}-${seqY}-----------"
                		echo "${BINDIR}/compareTwoCSBfiles ${COMP1}/${seqX}-${seqY}.${EXT1}.alg.master ${COMP2}/${seqX}-${seqY}.alg.csb.master ${COMP2}/${seqX}-${seqY}.alg.IR.master ${COMP2}/${seqX}-${seqY}.alg.TR.master ${COMP2}/${seqX}-${seqY}.alg.DUP.master ${seqX}-${seqY} ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} ${DIRREVER}/${seqY}-revercomp.${EXT} ${iGAP} ${eGAP} ${MAT} hola"
				${BINDIR}/compareTwoCSBfiles ${COMP1}/${seqX}-${seqY}.${EXT1}.alg.master ${COMP2}/${seqX}-${seqY}.alg.csb.master ${COMP2}/${seqX}-${seqY}.alg.IR.master ${COMP2}/${seqX}-${seqY}.alg.TR.master ${COMP2}/${seqX}-${seqY}.alg.DUP.master ${seqX}-${seqY} ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} ${DIRREVER}/${seqY}-revercomp.${EXT} ${iGAP} ${eGAP} ${MAT} hola > results/${seqX}-${seqY}.log
		fi
        done
done


fi
