#!/usr/bin/env bash
DIR1=$1
DIR2=$2
L=$3
S=$4
WL=$5
EXT=$6

array=()
array2=()
x=0
y=0

if [ $# != 6 ]; then
	echo "***ERROR*** Use: $0 chromosomesDirectory1 chromosomesDirectory2 L(200) S(40) K(8) fastaFilesExtension"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "$BINDIR"
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

mkdir csb

for ((i=0 ; i < ${#array[@]} ; i++))
#for ((i=0 ; i < 1 ; i++))
do
	for ((j=$i ; j < ${#array2[@]} ; j++))
	do
		if [[ $j != $i ]]; then
				seqX=${array[$i]}
				seqY=${array2[$j]}
				mkdir ${seqX}-${seqY}
				echo "----------${seqX}-${seqY}-----------"
			if [[ ! -f frags/${seqX}-${seqY}.frags ]];	then
			
	
				echo "time ~/programas/satsuma-code-0/SatsumaSynteny -t $DIR1/${seqX}.$EXT -q $DIR2/${seqY}.$EXT -n 2 -m 8 -l $L -o ${seqX}-${seqY}"
				time ~/programas/satsuma-code-0/SatsumaSynteny -t $DIR1/${seqX}.$EXT -q $DIR2/${seqY}.$EXT -n 2 -m 8 -l $L -o ${seqX}-${seqY} > ${seqX}-${seqY}.log			
				echo "${BINDIR}/fromSatsuma2CSB ${seqX}-${seqY}/satsuma_summary.chained.out csb/${seqX}-${seqY}.satsuma.csb $DIR1/${seqX}.${EXT} $DIR2/${seqY}.${EXT}"	
				${BINDIR}/fromSatsuma2CSB ${seqX}-${seqY}/satsuma_summary.chained.out csb/${seqX}-${seqY}.satsuma.csb $DIR1/${seqX}.${EXT} $DIR2/${seqY}.${EXT}
			fi
		fi
	done
done
