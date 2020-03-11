
// time manipulation functions: t=time, m=midpoint, p=percent(0-1), a=absolute(seconds)
function move_abs(t,m,a){return t + a }                     // 1h left=-3600, 1d right=86400
function move_pct(t,m,p){return t + p*Math.abs(t-m)*2 }     // 80% left=-0.8, 50% right=0.5
function zoom_abs(t,m,a){return m + t<m ? -a/2 : a/2 }      // 12h=12*3600, day=86400
function zoom_pct(t,m,p){return m + p*(t-m) }               // in=0.5  out=2.0
// snap_abs
// have to take into account tz offset before snap and add back again
// if range is too small then have to push right-side out
function snap_abs(t,m,a){
    var o=new Date(m*1000).getTimezoneOffset()*60;               // TZ offset in seconds
    var isright = t > m;
    var issmall = 2*Math.abs(t-m) < a;                          // does this detection break because floor became round?
    // +a/2 to convert floor to round?
//  return parseInt((t-o+a/2)/a,10)*a+o + ( isright && issmall ? a : 0 )
//  return Math.floor( (t-o)/a )*a+o + ( isright && issmall ? a : 0 )
//  return Math.floor( (t-o+a/2)/a )*a+o + ( isright && issmall ? a : 0 )
    return Math.round( (t-o)/a )*a+o + ( isright && issmall ? a : 0 )
}
var snap_pct = zoom_pct; // there is no snap_pct! == zoom!

//  // TODO: find next largest _nice_ range in seconds // used for auto snapping?
//  // usecase - snap to nearest nice interval?
//  function nicesec(r){
//      return [0].concat(
//          [1,5,10,15,30].map(i=>i*60),
//          [1,2,3,4,12].map(i=>i*60*60),
//          [1,2,5,7].map(i=>i*24*60*60),
//          [1,2,3,4].map(i=>i*7*24*60*60)
//      ).find(i=>i>r)
//  }

// datadog specific param updates
String.prototype.epochxform = function (callback,val){
    var extract = /(?<=(?:from_ts|to_ts)=)(\d{10})(\d{0,3})/g;
    var str = this;
    var avg = str
        .split('&')     .filter(i=>extract.test(i))     // split into param pairs and keep only those targetted
        .join('&')                                      // convert back to string for next split
        .split(/\D+/)   .filter(i=>/\d{10,13}/.test(i)) // split by non-digits and keep only sec|msec
        .map( i=>parseInt(i.substring(0,10),10) )       // truncate numbers to 10digits (seconds) and convert to int
        .reduce( (r,v,i,a)=>r+v/a.length, 0 );          // calc average time (should be center midpoint of graph xaxis)
    return str
        .replace(
            extract,                                    // globally replace target param pair _timestamp_ (note the non-capture groups!)
            (p0,p1,p2) =>                               // p0=matchedstring, p1=seconds, p2=msec
                Math.round(                             // round result of ...
                    callback( parseInt(p1,10),avg,val ) // callback( seconds,avg, val ) = move,zoom,snap,etc
                )
                .toString()                             // convert to string
                .concat( p2.replace(/\d/g,'0') )        // append msec if found but replace with zeros first
        )
};  // semicolon required because this is actually assignment

function ddnav(callback,param){
    var newparams = window.location.search;
    newparams.replace('live=true','live=false');
    newparams = newparams.epochxform(callback,param);
    var to_ts = newparams.match(/to_ts=(\d+)/);         // 0=match, 1=group1, group2
    if( to_ts ){
        newparams.replace(/(?<=eval_ts=)(\d+)/,to_ts[2]);
    }
    window.location.search = newparams
}
// examples of use commented out
// ddnav(move_pct,-0.5)        // move left 50%
// ddnav(move_pct,-0.3)        // move left 30%
// ddnav(move_abs,-4*3600)     // move left 4h
// ddnav(move_abs,-2*3600)     // move left 2h
// ddnav(move_abs,-3600)       // move left 1h
// ddnav(zoom_pct,2)           // zoom out 100% (2x)
// ddnav(snap_abs,300)         // snap edges to :5
// ddnav(snap_abs,600)         // snap edges to :10
// ddnav(snap_abs,900)         // snap edges to :15
// ddnav(snap_abs,1800)        // snap edges to :30
// ddnav(snap_abs,3600)        // snap edges to hour
// ddnav(snap_abs,3*3600)      // snap edges to 3h
// ddnav(snap_abs,4*3600)      // snap edges to 4h
// ddnav(snap_abs,12*3600)     // snap edges to 12h
// ddnav(snap_abs,24*3600)     // snap edges to 1d
// ddnav(snap_abs,2*24*3600)   // snap edges to 2d
// ddnav(snap_abs,7*24*3600)   // snap edges to 1w
// ddnav(snap_abs,2*7*24*3600) // snap edges to 2w
// ddnav(zoom_pct,0.5)         // zoom in 50% (.5x)
// ddnav(move_abs,3600)        // move right 1h
// ddnav(move_abs,2*3600)      // move right 2h
// ddnav(move_abs,4*3600)      // move right 4h
// ddnav(move_pct,0.3)         // move right 30%
// ddnav(move_pct,0.5)         // move right 50%
