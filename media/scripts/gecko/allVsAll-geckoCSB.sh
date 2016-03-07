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
	echo "***ERROR*** Use: $0 chromosomesDirectory1 chromosomesDirectory2 L(200) S(40) K(8) fastaFilesExtension chromosomas(0: allVsAll 1: folder1Vsfolder2) "
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

## En caso de todos vs todos (genomas con un solo cromosoma)
if [[ ${CRO} == 0 ]]; then
	for ((i=0 ; i < ${#array[@]} ; i++))
	do
        	for ((j=$i ; j < ${#array2[@]} ; j++))
        	do
               		if [ $i != $j ]; then
                                seqX=${array[$i]}
                                seqY=${array2[$j]}
                                echo "----------${seqX}-${seqY}-----------"
                        	if [[ ! -f frags/${seqX}-${seqY}.frags ]];      then

                                	echo "${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1"
                               		 ${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1
                        	fi
                	fi
        	done
	done
fi

## En caso de que los genomas tengan mas cromosomas, se hace una carpeta contra la otra
if [[ ${CRO} == 1 ]]; then

	for ((i=0 ; i < ${#array[@]} ; i++))
	do
		for ((j=0 ; j < ${#array2[@]} ; j++))
		do
			seqX=${array[$i]}
			seqY=${array2[$j]}
			echo "----------${seqX}-${seqY}-----------"
			if [[ ! -f frags/${seqX}-${seqY}.frags ]];	then
				echo "${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1"
				${BINDIR}/EE.sh $DIR1/${seqX}.$EXT $DIR2/${seqY}.$EXT $L $S $WL 1 
			fi
		done
	done
fi
