

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

folderIn=$1 # folder with geneFeatures
output=$2 # folder output files
ngenomes=$3
path=../bin


if [ $# -ne 3 ]; then
	echo "***ERROR*** Use: $0 folderIn FolderOut ngenomes"
	exit -1
fi

array=()
x=0
for elem in $(ls -d $1/*.frags | awk -F "/" '{print $NF}'|awk -F ".frags" '{print $1}' )
#for elem in $folder/*
do
	#if [[ -f $elem ]]; then
		array[$x]=$elem
		x=`expr $x + 1`
		echo "X: $elem.frags"
	#fi
done

for ((i=0 ; i < ${#array[@]} ; i++))
	do
	echo "${BINDIR}/fuzzyGenomeAbundance-mapping $1/${array[$i]}.frags 1 $output/output.frags $output/output.frags.txt 1 $ngenomes 100 4 i > $output/${array[$i]}.mapping.txt"
		${BINDIR}/fuzzyGenomeAbundance-mapping $1/${array[$i]}.frags 1 $output/${array[$i]}.abundance $output/output.frags.txt 1 $ngenomes 100 4 i > $output/${array[$i]}.abundance.txt

		rm $output/output.frags.txt
	done