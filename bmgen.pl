#!/usr/bin/perl -l
# perl script to convert javascript to bookmarklet
use strict;
use URI::Escape;

my @data = <DATA>;

print "<html><body>";

foreach my $list ( (
    ["<.5",    "ddnav(move_pct,-0.5)"],
    ["<.3",    "ddnav(move_pct,-0.3)"],
    ["<4h",    "ddnav(move_abs,-4*3600)"],
    ["<2h",    "ddnav(move_abs,-2*3600)"],
    ["<h",     "ddnav(move_abs,-3600)"],
    ["z-",     "ddnav(zoom_pct,2)"],
    ["[h]",    "ddnav(snap_abs,3600)"],
    ["[3h]",   "ddnav(snap_abs,3*3600)"],
    ["[4h]",   "ddnav(snap_abs,4*3600)"],
    ["[12h]",  "ddnav(snap_abs,12*3600)"],
    ["[d]",    "ddnav(snap_abs,24*3600)"],
    ["[2d]",   "ddnav(snap_abs,2*24*3600)"],
    ["[w]",    "ddnav(snap_abs,7*24*3600)"],
    ["[2w]",   "ddnav(snap_abs,2*7*24*3600)"],
    ["z+",     "ddnav(zoom_pct,2)"],
    ["h>",     "ddnav(move_abs,3600)"],
    ["2h>",    "ddnav(move_abs,4*3600)"],
    ["4h>",    "ddnav(move_abs,4*3600)"],
    [".3>",    "ddnav(move_pct,0.3)"],
    [".5>",    "ddnav(move_pct,0.5)"],
))
{
    my ($key,$cmd)= @{$list};
    $key =~  s/</\&lt/g;    # poor mans HTML::Escape
    $key =~  s/>/\&gt/g;    # poor mans HTML::Escape
    my $js =
        uri_escape
            join "",
        #   map {s/ /%20/g;$_}
            map {s/(?<!\w)\s+|\s+(?!\w)//g; $_} # strip ALL spaces UNLESS surrounded by alphanum
            join " ",                           # join lines with spaces
            map {chomp $_;              $_}     # strip crlf
            map {s{\s*//.*}{}g;         $_}     # strip comments
            (
                @data,
                $cmd,
            );
    print qq(<a href="javascript:(function(){$js})()">$key</a><br>);
}
print "</body></html>";

__DATA__
// time manipulation functions: t=time, m=midpoint, p=percent(0-1), a=absolute(seconds)
function move_abs(t,m,a){return t + a }                     // 1h left=-3600, 1d right=86400
function move_pct(t,m,p){return t + p*Math.abs(t-m)*2 }     // 80% left=-0.8, 50% right=0.5
function zoom_abs(t,m,a){return m + t<m ? -a/2 : a/2 }      // 12h=12*3600, day=86400
function zoom_pct(t,m,p){return m + p*(t-m) }               // in=0.5  out=2.0
// snap_abs
// have to take into account tz offset before snap and add back again
// if range is too small then have to push right-side out
function snap_abs(t,m,a){
    var o=new Date().getTimezoneOffset()*60; //sec
    var isright = t > m;
    var issmall = 2*Math.abs(t-m) < a;
    return parseInt((t-o)/a,10)*a+o + ( isright && issmall ? a : 0 )
}
var snap_pct = zoom_pct; // there is no snap_pct! == zoom!


//  // find next largest _nice_ range in seconds // used for auto snapping?
//  // usecase - snap to nearest nice interval?
//  function nicesec(r){
//      return [0].concat(
//          [1,5,10,15,30].map(i=>i*60),
//          [1,2,3,4,12].map(i=>i*60*60),
//          [1,2,5,7].map(i=>i*24*60*60),
//          [1,2,3,4].map(i=>i*7*24*60*60)
//      ).find(i=>i>r)
//  }

// debugging epochms into iso format - spews to console but is chainable
String.prototype.when = function(){
    var o=new Date().getTimezoneOffset()*60*1000; // msec offset from UTC
    this.replace(
        /\d{10,13}/g,
        m => {
            console.log(
                m.substr(0,10),
                ' ',
                new Date( parseInt(m.substr(0,10),10)*1000-o ) .toISOString().replace('Z','')
            )
        }
    );
    return this
};  // is assignment, not just function declaration

// datadog specific param updates
String.prototype.epochxform = function (callback,arg){
    var extract = /(?<=(?:from_ts|to_ts)=)(\d{10})(\d{0,3})/g;
    var str = this;
    var avg = str
        .split('&')     .filter(i=>extract.test(i))     // only interesting args with epochs
        .join('&')                                      // convert back to string for next split
        .split(/\D+/)   .filter(i=>/\d{10,13}/.test(i)) // extract epoch sec|msec
        .map( i=>parseInt(i.substring(0,10),10) )       // convert to int seconds
        .reduce( (r,v,i,a)=>r+v/a.length, 0 );          // calc average
    return str
        .replace(
            extract,                                    // extract seconds[subsec]
            (p0,p1,p2) =>
                Math.round(
                    callback( parseInt(p1,10),avg,arg ) // callback( seconds,avg, arg )
                )
                .toString()                             // convert to string
                .concat( p2.replace(/\d/g,'0') )        // concat subsec as zeros if found
        )
};  // semicolon required because this is actually assignment

function ddnav(callback,param){
    var newparams = window.location.search;
    newparams.replace('live=true','live=false');
    newparams = newparams.epochxform(callback,param);
    var to_ts = newparams.match(/to_ts=(\d+)/);
    if( to_ts ){
        newparams.replace(/(?<=eval_ts=)(\d+)/,to_ts[2]);
    }
    window.location.search = newparams
}

// ddnav(move,-3600)
