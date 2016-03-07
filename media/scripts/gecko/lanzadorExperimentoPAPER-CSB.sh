#!/bin/bash

# numero de cpus que empleara el calculo:
#SBATCH -c 1
# memoria que empleara el calculo:
#SBATCH --mem=20gb
# si se sabe cuanto va a tardar aproximadamente se debe indicar :
#SBATCH --time=120:00:00
# Set output and error files
##SBATCH --error=job.%J.err
##SBATCH --output=job.%J.out
##SBATCH --partition=longq


if [ $# -lt 6 ]; then
   echo " ==== ERROR ... you called this script inappropriately."
   echo ""
   echo "   usage:  $0 fragsFile outFolder Length Similarity karpar infFolder"
   echo ""
   exit -1
fi

# Lista de parametros

#BINDIR="/mnt/home/users/tic_182_uma/arjona/SVN/LNCCInstallation/HSPandCSB/bin"
BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Argumentos de entrada

fragsFile=${1}
outFolder=${2}
Longitud=${3}
Similitud=${4}
karpar=${5}
inf=${6}

iGap="10"
eGap="1"

temp="temp"

# creamos una carpeta donde meter todos los archivos que se generen

mkdir $outFolder
name=$(basename "$1")

# Filtramos por p-value
echo "${BINDIR}/pvalueFilter ${fragsFile} ${karpar} ${outFolder}/${name}.fil ${fragsFile}.deleted 1"
time ${BINDIR}/pvalueFilter ${fragsFile} ${karpar} ${outFolder}/${name}.fil ${fragsFile}.deleted 1


# Pasamos los frags a master
echo "time ${BINDIR}/fragstoMasterByLengthAndSimilarity ${outFolder}/${name}.fil ${outFolder}/${name}.master ${Longitud} ${Similitud}"
time ${BINDIR}/fragstoMasterByLengthAndSimilarity ${outFolder}/${name}.fil ${outFolder}/${name}.master ${Longitud} ${Similitud}


# Join doubleOverlapped - Step 1
echo "time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.master ${outFolder}/${name}.step1"
time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.master ${outFolder}/${name}.step1

###########################################################
# Join frags into CSB - Step 2
echo "time ${BINDIR}/joinCSB ${outFolder}/${name}.master ${outFolder}/${name}.step1 ${outFolder}/${name}.step2.tmp ${iGap} ${eGap}"
time ${BINDIR}/joinCSB ${outFolder}/${name}.master ${outFolder}/${name}.step1 ${outFolder}/${name}.step2.tmp ${iGap} ${eGap}
rm ${outFolder}/master

# Join doubleOverlapped - Step 2.1
echo "time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step2.tmp ${outFolder}/${name}.step1"
time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step2.tmp ${outFolder}/${name}.step2
rm ${outFolder}/${name}.step2.tmp
###################################################
# Extract Repeats - Step 3
echo "time ${BINDIR}/extractRepeats ${outFolder}/${name}.master ${outFolder}/${name}.step2 ${outFolder}/${name}.step3.tmp ${iGap} ${eGap} ${outFolder}/${name}.repeats"
time ${BINDIR}/extractRepeats ${outFolder}/${name}.master ${outFolder}/${name}.step2 ${outFolder}/${name}.step3.tmp ${iGap} ${eGap} ${outFolder}/${name}.repeats 

# Join doubleOverlapped - Step 3.1
echo "time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step3.tmp ${outFolder}/${name}.step3"
time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step3.tmp ${outFolder}/${name}.step3
rm ${outFolder}/${name}.step3.tmp
###################################################
# Join CSB - Step 4
echo "time ${BINDIR}/joinCSB ${outFolder}/${name}.master ${outFolder}/${name}.step3 ${outFolder}/${name}.step4.tmp ${iGap} ${eGap}"
time ${BINDIR}/joinCSB ${outFolder}/${name}.master ${outFolder}/${name}.step3 ${outFolder}/${name}.step4.tmp ${iGap} ${eGap}
rm ${outFolder}/master

# Join doubleOverlapped - Step 4.1
echo "time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step4.tmp ${outFolder}/${name}.step4"
time ${BINDIR}/joinDoubleOverlapped ${outFolder}/${name}.master ${outFolder}/${name}.step4.tmp ${outFolder}/${name}.step4
rm ${outFolder}/${name}.step4.tmp




# Get csv file
echo "time ${BINDIR}/csb2csv ${outFolder}/${name}.step2 ${outFolder}/${name}.master > ${outFolder}/${name}.step2.csv"
time ${BINDIR}/csb2csv ${outFolder}/${name}.step2 ${outFolder}/${name}.master > ${outFolder}/${name}.step2.csv.tmp
cat ${inf}/${name}.INF ${outFolder}/${name}.step2.csv.tmp > ${outFolder}/${name}.step2.csv
rm ${outFolder}/${name}.step2.csv.tmp


# Get csv repeats
echo "time ${BINDIR}/csb2csv ${outFolder}/${name}.repeats ${outFolder}/${name}.master > ${outFolder}/${name}.repeats.csv"
time ${BINDIR}/csb2csv ${outFolder}/${name}.repeats ${outFolder}/${name}.master > ${outFolder}/${name}.repeats.csv.tmp
cat ${inf}/${name}.INF ${outFolder}/${name}.repeats.csv.tmp > ${outFolder}/${name}.repeats.csv
rm ${outFolder}/${name}.repeats.csv.tmp


# Get csv file
echo "time ${BINDIR}/csb2csv ${outFolder}/${name}.step4 ${outFolder}/${name}.master > ${outFolder}/${name}.step4.csv"
time ${BINDIR}/csb2csv ${outFolder}/${name}.step4 ${outFolder}/${name}.master > ${outFolder}/${name}.step4.csv.tmp
cat ${inf}/${name}.INF ${outFolder}/${name}.step4.csv.tmp > ${outFolder}/${name}.step4.csv
rm ${outFolder}/${name}.step4.csv.tmp
