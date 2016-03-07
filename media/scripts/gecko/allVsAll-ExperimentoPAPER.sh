#!/usr/bin/env bash
DIR=$1
EXT=$2
FragsDirectory=$3
folderOut=$4
Length=$5
Similarity=$6
karpar=$7

/lanzadorExperimentoPAPER-CSB.sh frags/NC_007295.1-NC_017509.1.frags exp1 1 1 karpar/myco.karpar

array=()
x=0

if [ $# != 2 ]; then
	echo "***ERROR*** Use: $0 1genomesFastaDirectory 2fastaFilesExtension 3fragsDirectory 4outFolder 5Length 6Similarity 7karpar"
	exit -1
fi

BINDIR="/mnt/home/users/tic_182_uma/arjona/SVN/LNCCInstallation/HSPandCSB/bin"

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
		
			
			echo "${BINDIR}/lanzadorExperimentoPAPER-CSB.sh ${FragsDirectory}/${seqX}-${seqY}.frags ${folderOut} ${Length} ${Similarity} ${karpar}"
			${BINDIR}/lanzadorExperimentoPAPER-CSB.sh ${FragsDirectory}/${seqX}-${seqY}.frags ${folderOut} ${Length} ${Similarity} ${karpar}  

			fi
	done
done
