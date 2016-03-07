#!/usr/bin/perl -w
####Programa para obtener los locus_tag a partir de un genbank.

if (!$ARGV[0]){
        print "Introduzca el nombre del su fichero genbank con extension: ";
		$name=<STDIN>;
		chomp $name;
}
else{
	$name=$ARGV[0];
	}
	open (gbk,"$name") || die "Error: problem opening codigos\n";
	open (results, ">$name-parseado") || die "Error: problem creating results\n";

chomp $_;
while (<gbk>){
	
	if ($_=~/^\s+\/CDS/){
		
		
		print results "$_";
	}
	chomp $_;
	
	
}
close (gbk);
close (results);


				     


