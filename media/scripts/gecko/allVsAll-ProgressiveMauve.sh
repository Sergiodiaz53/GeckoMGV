#!/usr/bin/env bash
DIR=$1
EXT=$2

array=()
x=0

if [ $# != 2 ]; then
	echo "***ERROR*** Use: $0 genomesDirectory fastaFilesExtension"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for elem in $(ls -d $DIR/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	echo "X: $elem"
done

for ((i=0 ; i < ${#array[@]} ; i++))
#for ((i=0 ; i < 1 ; i++))
do
	for ((j=i ; j < ${#array[@]} ; j++))
	do
		if [ $i != $j ]; then
				seqX=${array[$i]}
				seqY=${array[$j]}
				echo "----------${seqX}-${seqY}-----------"
			if [[ ! -f frags/${seqX}-${seqY}.frags ]];	then
				
				echo "${BINDIR}/comparacion-progressiveMauve.sh $DIR/${seqX}.$EXT $DIR/${seqY}.$EXT"
				time ${BINDIR}/comparacion-progressiveMauve.sh $DIR/${seqX}.$EXT $DIR/${seqY}.$EXT > ${seqX}-${seqY}.log.txt
				# fromMauve2CSB Dm-2L-Ds-W501-2L.mauve.backbone salida.csb ../fasta/Dm/Dm-2L.fasta ../fasta/Ds/Ds-W501-2L.fasta

				echo "${BINDIR}/fromMauve2CSB ${seqX}-${seqY}.mauve.backbone ${seqX}-${seqY}.mauve.csb $DIR/${seqX}.$EXT $DIR/${seqY}.$EXT"
				${BINDIR}/fromMauve2CSB ${seqX}-${seqY}.mauve.backbone ${seqX}-${seqY}.mauve.csb $DIR/${seqX}.$EXT $DIR/${seqY}.$EXT			
			fi
		fi
	done
done
