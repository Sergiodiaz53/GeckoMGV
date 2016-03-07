#!/usr/bin/env bash
metaDir=$1
genomeDir=$2
L=$3
S=$4
WL=$5
EXT=$6

array=()
x=0

array2=()
y=0

if [ $# != 6 ]; then
	echo "***ERROR*** Use: $0 metagenomesDir genomesDir L(200) S(40) K(8) fastaFilesExtension"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for elem in $(ls -d ${metaDir}/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	#echo "X: $elem"
done

for elem in $(ls -d ${genomeDir}/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array2[$y]=$elem
	y=`expr $y + 1`
	#echo "X: $elem"
done

for ((i=0 ; i < ${#array[@]} ; i++))
do
	for ((j=0 ; j < ${#array2[@]} ; j++))
	do
		seqX=${array[$i]}
		seqY=${array2[$j]}
		echo "----------${seqX}-${seqY}-----------"
		if [[ ! -f results/${seqX}-${seqY}.frags ]];	then
			echo "${BINDIR}/workflow.sh ${metaDir}/${seqX}.$EXT ${genomeDir}/${seqY}.$EXT $L $S $WL 1"
			${BINDIR}/workflow.sh ${metaDir}/${seqX}.$EXT ${genomeDir}/${seqY}.$EXT $L $S $WL 1 1
		fi
	done

	rm -rf results/${seqX}-all.relative*.frags results/*.INF results/*.MAT

	find results/ -name "${seqX}*.frags" -not -name "${seqX}*relative*.frags" -exec bash -c ${BINDIR}/'sortFragsBySeqX 10000000 32 '{}' '{}'.sorted &> /dev/null ; mv '{}'.sorted '{} \;
	find results/ -name "${seqX}*.frags" -not -name "${seqX}*relative*.frags" | sort > results/${seqX}-genomesList.txt

	#echo "=========> First genome list"
	#cat results/${seqX}-genomesList.txt
	#echo "<========="
	echo "${BINDIR}/mergeMetagenomeFrags results/${seqX}-genomesList.txt ${metaDir}/${seqX}.$EXT results/${seqX}-all.relative"
	${BINDIR}/mergeMetagenomeFrags results/${seqX}-genomesList.txt ${metaDir}/${seqX}.$EXT results/${seqX}-all.relative
	rm -rf results/${seqX}-genomesList.txt
	find results/ -not -type d -name "${seqX}*.frags" -not -name "*.relative*.frags" -exec rm -rf {} \;
	${BINDIR}/mgReadsIndex ${metaDir}/${seqX}.$EXT &> /dev/null
	mv ${metaDir}/${seqX}.$EXT.IND results/
	
	find ${genomeDir}/ -name "*.${EXT}" -exec bash -c 'path=$('${BINDIR}'/readlink.sh '{}');name=$(basename '{}');name="${name%.*}";echo "${path} ${name}"' \; | sort > results/${seqX}-genomesList.txt

	#echo "=========> Second genome list"
	#cat results/${seqX}-genomesList.txt
	#echo "<========="
	x=0
	for elem in $(ls -d results/${seqX}-all.relative*.frags)
	do
		mapping=$(printf "results/%s-mapping-%03d.txt" ${seqX} $x)
		aligned=$(printf "results/%s-all.aligned-%03d.txt" ${seqX} $x)
		${BINDIR}/bestGenomeInRead $elem 1 $elem.filtered $elem.filtered.txt 1 > ${mapping}
		rm -rf $elem.filtered $elem.filtered.txt
	
		${BINDIR}/mgFoIview2TXT-R2G results/${seqX}-genomesList.txt ${metaDir}/${seqX}.$EXT results/${seqX}.$EXT.IND $elem $mapping $aligned
		x=`expr $x + 1`
	done

	cat results/${seqX}-mapping-*.txt > results/${seqX}-mapping.txt
	cat results/${seqX}-all.aligned-*.txt > results/${seqX}-all.aligned.txt

	rm -rf results/${seqX}-mapping-*.txt results/${seqX}-all.aligned-*.txt
done

