#!/usr/bin/env bash
DIR1=$1
DIR2=$2
EXT=$3
K=$4
OUTPUT_MAUVE=$5
OUTPUT_CSB=$6
CRO=$7

array=()
array2=()
x=0
y=0

if [ $# != 7 ]; then
	echo "***ERROR*** Use: $0 chromosomesDirectory1 chromosomesDirectory2 fastaFilesExtension K output_mauve output_csb Crom ( 0: allVsall 1: folder1 vs folder2)"
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
				echo "----------${seqX}-${seqY}-----------"
			if [[ ! -f ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ]];	then
				echo "~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} --seed-weight=${K}"
				~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve --backbone-output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} > ${OUTPUT_MAUVE}/${seqX}-${seqY}.log
				#entrada.blast salida.csb seqX.fasta seqY.fasta
			fi
			if [[ ! -f ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ]];then	
				echo "${BINDIR}/fromMauve2CSB ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT}"
				${BINDIR}/fromMauve2CSB ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT}
			fi
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
                                echo "----------${seqX}-${seqY}-----------"
                        if [[ ! -f ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ]];  then
                                echo "~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve --backbone-output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} > ${OUTPUT_MAUVE}/${seqX}-${seqY}.log"
                        #        ~/programs/mauve_2.4.0/linux-x64/progressiveMauve --output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve --backbone-output=${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT} > ${OUTPUT_MAUVE}/${seqX}-${seqY}.log
                                #entrada.blast salida.csb seqX.fasta seqY.fasta
                        fi 
			if [[ ! -f ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ]]; then
				echo "${BINDIR}/fromMauve2CSB ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT}"
                                ${BINDIR}/fromMauve2CSB ${OUTPUT_MAUVE}/${seqX}-${seqY}.mauve.backbone ${OUTPUT_CSB}/${seqX}-${seqY}.mauve.csb ${DIR1}/${seqX}.${EXT} ${DIR2}/${seqY}.${EXT}
                        fi
                fi
        done
done


fi
