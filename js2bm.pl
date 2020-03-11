#!/usr/bin/perl
# perl script to convert javascript to bookmarklet
# expect JS from stdin only.
# args to script become bookmarklet label
# usage: cat javascript-code | js2bm.pl [bookmarklet-label]
use strict;
use URI::Escape;

my $anchor = join" ",@ARGV;
@ARGV=();
my $js =
    uri_escape
        join "",
    #   map {s/ /%20/g;$_}
        map {s/(?<!\w)\s+|\s+(?!\w)//g; $_} # strip ALL spaces UNLESS surrounded by alphanum
        join " ",                           # join lines with spaces
        map {chomp $_;              $_}     # strip crlf
        map {s{\s*//.*}{}g;         $_}     # strip comments
        <>;
print qq|<a href="| if $anchor;
print qq|javascript:(function(){|;
print $js ;
print qq|})()|;
print qq|">$anchor</a><br>| if $anchor;
