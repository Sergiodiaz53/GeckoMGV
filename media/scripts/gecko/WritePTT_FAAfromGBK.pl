#!/usr/bin/perl -w

my $gbk_file = $ARGV[0];
my $org_name = $ARGV[1];

if ($#ARGV < 1) {
	print "Usage: WritePTT_FAAfromGBK.pl  <gbk_file_name> <genome_name>\n";
	print "     (example: WritePTT_FAAfromGBK.pl NC_007332.gbk Mycoplasma_hyopneumoniae_7448)\n";
	exit(1);
}

$found_gene = "false";
#$found_seq = "false";

#print "\nWriting files: $org_name.ptt and $org_name.faa\n";

open (PTT,">$org_name.ptt");

$org_name_spaces = $org_name;
$org_name_spaces =~ s/\_/ /g;
$numeric_id = 1;

#open (FAA,">$org_name.faa");
my $gene = "-";
open(ARQ,"$gbk_file");
while (<ARQ>)
{
	if (/ORGANISM\s+(.+)/)
	{
		$org = $1;
	}
	elsif (/^LOCUS\s+\S+\s+(\d+)\s+/) #LOCUS       CIAT899_chromosome   3837061 bp    DNA     linear       05-MAR-2012
	{
		$genome_size = $1;
	}
	elsif (/CDS\s*(\d+)\.\.(\d+)/)
	{       
		$strand =  "f";
		$start = $1;
		$stop = $2;
		$gi = "";
		$found_gene = "true";	       
	}
	elsif (/CDS\s*complement\((\d+)\.\.(\d+)/)
	{       
		$strand =  "r";
		$start = $1;
		$stop = $2;
		$gi = "";
		$found_gene = "true";
	}
	elsif (/CDS\s+.*join\((\d+)\.\..+\.\.(\d+)/)
	{
		$strand =  "f";
		$start = $1;
		$stop = $2;
		$gi = "";
		$found_gene = "true";
	}
	elsif (($found_gene eq "true") && (/\/gene\=\"(.+)\"/))
	{       
		$gene = $1;
		if ($gene =~ /hypothetical/)
		{
			$gene = "-";
		}
	}      
	elsif (($found_gene eq "true") && (/\s+\/product=\"(.+)\"/))
	{
	 $product = $1;
	}
	elsif (($found_gene eq "true") && (/\s+\/protein_id=\"(.+)\"/))
	{
		$gi = $1;
		$syn = $gi if ((not defined $syn) || ($syn eq ""));	
		$gi = $syn if ((not defined $gi) || ($gi eq ""));
		$size = abs($stop-$start);
		$ptt_line .= "$numeric_id\t$start\t$stop\t$strand\t$size\t$gi\t$gene\t$syn\t$product\t\n";
		$cont_genes++;
		$gene = "-";
		$numeric_id++;
	}
	elsif (/\s+\/locus_tag=\"(.+)\"/)
	{
		$syn = $1;
	}	 
}

#print PTT "$org, complete genome - 1..$genome_size\n";
#print PTT "$org_name_spaces, complete genome - 1..$genome_size\n";
#print PTT "$cont_genes proteins\n";ID	Start	Stop	Strand	Size	Gi	Gene	Synonym	Product
print PTT "ID	Start	Stop	Strand	Size	Gi	Gene	Synonym	Product\n";
print PTT $ptt_line;

#close FAA;
close PTT;
