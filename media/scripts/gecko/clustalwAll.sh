DIR=$1
EXT=$2
OUT=$3


array=()
x=0

if [ $# != 4 ]; then
	echo "***ERROR*** Use: $0 clustalwAll folderIN extension folderOut"
	exit -1
fi



for elem in $(ls -d $DIR/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	#echo "X: $elem"
done

for ((i=0 ; i < ${#array[@]} ; i++))
do
	clustalw ${array[$i]}.$EXT > $OUT/${array[$i]}.log
	
done
