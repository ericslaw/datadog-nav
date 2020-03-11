#!/usr/bin/perl -l
# perl script to convert javascript to bookmarklet
use strict;
use URI::Escape;

my $js =
    uri_escape
        join "",
    #   map {s/ /%20/g;$_}
        map {s/(?<!\w)\s+|\s+(?!\w)//g; $_} # strip ALL spaces UNLESS surrounded by alphanum
        join " ",                           # join lines with spaces
        map {chomp $_;              $_}     # strip crlf
        map {s{\s*//.*}{}g;         $_}     # strip comments
        <>;
print qq(javascript:(function(){$js})());
#print $js;
