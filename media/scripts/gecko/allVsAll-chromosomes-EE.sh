#!/usr/bin/env bash
DIR1=$1
DIR2=$2
L=$3
S=$4
WL=$5
EXT=$6

CRO=$7


array=()
array2=()
x=0
y=0

if [ $# != 7 ]; then
	echo "***ERROR*** Use: $0 chromosomesDirectory1 chromosomesDirectory2 L(200) S(40) K(8) fastaFilesExtension cromosome(0: AllVsAll 1:folder1 vs folder2)"
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

if [[ ${CRO} == 0 ]];then
	for ((i=0 ; i < ${#array[@]} ; i++))
	do
		for ((j=$i ; j < ${#array2[@]} ; j++))
		do
			if [ $i != $j ]; then
					seqX=${array[$i]}
					seqY=${array2[$j]}
					echo "----------${seqX}-${seqY}-----------"
				if [[ ! -f frags/${seqX}-${seqY}.frags ]];	then
				
					echo "${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1"
					time ${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1 > ${seqX}-${seqY}.log 
			
				fi
			fi
		done
	done	
fi


# Folder 1 vs Folder 2
if [[ ${CRO} == 1 ]];then
        for ((i=0 ; i < ${#array[@]} ; i++))
        do
                for ((j=0 ; j < ${#array2[@]} ; j++))
                do
                	seqX=${array[$i]}
                        seqY=${array2[$j]}
                        echo "----------${seqX}-${seqY}-----------"
                        if [[ ! -f frags/${seqX}-${seqY}.frags ]];      then
	                        echo "${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1"
        	                time ${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1 > ${seqX}-${seqY}.log
                        fi
                done
        done
fi

