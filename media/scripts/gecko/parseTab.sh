# parseTab

# This program takes gene features files in fasta format and parses it into a bin file.


BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

folderIn=$1 # folder with geneFeatures
output=$2 # folder output files

path=../bin


if [ $# -ne 2 ]; then
	echo "***ERROR*** Use: $0 folderIn FolderOut"
	exit -1
fi

array=()
x=0
for elem in $(ls -d $1/*.geneFeature | awk -F "/" '{print $NF}'|awk -F ".geneFeature" '{print $1}' )
#for elem in $folder/*
do
	#if [[ -f $elem ]]; then
		array[$x]=$elem
		x=`expr $x + 1`
		echo "X: $elem.geneFeature"
	#fi
done

for ((i=0 ; i < ${#array[@]} ; i++))
	do
		grep ">" $1/${array[$i]}.geneFeature | sed -r 's/>lcl\|//g' | sed -r 's/\[gene=//g' | sed -r 's/\[locus_tag=//g' | sed -r 's/\[location=//g' | sed -r 's/<//g' | sed -r 's/>//g' | sed -r 's/\]//g' > $output/${array[$i]}.tmp
		${BINDIR}/parseGeneFeatureTab $output/${array[$i]}.tmp $output/${array[$i]}.gene $output/${array[$i]}.gene.csv
		#rm $output/${array[$i]}.tmp
	done

	
	## GeneBank
array=()
x=0
for elem in $(ls -d $1/*.gb | awk -F "/" '{print $NF}'|awk -F ".gb" '{print $1}' )
#for elem in $folder/*
do
	if [[ -f $elem ]]; then
		array[$x]=$elem
		x=`expr $x + 1`
		echo "X: $elem.gb"
	fi
done

	for ((i=0 ; i < ${#array[@]} ; i++))
		do
			${BINDIR}/WritePTT_FAAfromGBK.pl $1/${array[$i]}.gb ${array[$i]}
			${BINDIR}/parseGeneBankTab $1/${array[$i]}.ptt $output/${array[$i]}.gene $output/${array[$i]}.gene.csv 
			#rm $output/${array[$i]}.tmp
		
		done

		
		

## GFF
array=()
x=0
for elem in $(ls -d $1/*.gff | awk -F "/" '{print $NF}'|awk -F ".gff" '{print $1}' )
#for elem in $folder/*
do
	#if [[ -f $elem ]]; then
		array[$x]=$elem
		x=`expr $x + 1`
		echo "X: $elem.gff"
	#fi
done

for ((i=0 ; i < ${#array[@]} ; i++))
	do
		 sed 's/\%2C/,/g' ${array[$i]}.gff | sed 's/\%28/\(/g' | sed 's/\%29/\)/g'| sed 's/\%3B/;/g' | sed 's/\%20/ /g'| sed 's/\%2F/\//g'| sed 's/\%27/"/g' > ${array[$i]}.gff.tmp;
	#	 sed 's/\%28/\(/g' ${array[$i]}.gff.tmp > ${array[$i]}.gff;
	#	 sed 's/\%29/\)/g' ${array[$i]}.gff > ${array[$i]}.gff.tmp;
	#	 sed 's/\%3B/;/g' ${array[$i]}.gff.tmp > ${array[$i]}.gff;
	#	 sed 's/\%20/ /g' ${array[$i]}.gff > ${array[$i]}.gff.tmp;
	#	 sed 's/\%2F/\//g' ${array[$i]}.gff.tmp > ${array[$i]}.gff;
	#	 sed 's/\%27/"/g' ${array[$i]}.gff > ${array[$i]}.gff.tmp;
		 
		${BINDIR}/parseGFF $1/${array[$i]}.gff.tmp $output/${array[$i]}.gene $output/${array[$i]}.gene.csv 
		rm ${array[$i]}.gff.tmp
	done




