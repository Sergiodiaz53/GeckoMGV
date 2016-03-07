#!/usr/bin/env bash


# Toma una carpeta con fragmentos, la pasa a anchor y ejecuta grim.

DIR=$1 # Directorio de frags
FASTAS=$2 # Directorio de fastas
GRIMM=$3 # Directorio programas DRIM
OUT=$4 # Directorio Salida 
EXT=$5 # Extension de frags.

array=()
x=0

if [ $# != 3 ]; then
	echo "***ERROR*** Use: $0 fragsDirectory DRIMMprogram OutputFolder"
	exit -1
fi

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for elem in $(ls -d $DIR/*.$EXT | awk -F "/" '{print $NF}' | awk -F ".$EXT" '{print $1}')
do
	array[$x]=$elem
	x=`expr $x + 1`
	#echo "X: $elem"
done

for ((i=0 ; i < ${#array[@]} ; i++))
do
	seqX=${array[$i]}
	# Pasamos a anchored
	${BINDIR}/frags2GRIMM $DIR/${seqX}.$EXT $OUT/${seqY}.anchor 

	# Ejecutramos grim
	$GRIMM/grimm_synt -A -f $OUT/${seqY}.anchor -d $OUT
	
	# Pasamos a csv
	
			
done
