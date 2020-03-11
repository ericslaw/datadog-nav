// drop a datadog URL onto a dashboard and only update the timeframes
function drop_time(ev) {
    ev.preventDefault(); // required
    if(ev.type == 'drop'){
        var payload = event.dataTransfer.getData('URL');
        var dropurl = new URLSearchParams(payload.replace(/.*[?]/,""));
        var pageurl = new URLSearchParams(window.location.search);

        'from_ts,to_ts,eval_ts,live'.split(',').map(key=>{
            if ( dropurl.has(key) ){
                pageurl.set(key, dropurl.get(key) );
            }
        });
        window.location.search = '?' + pageurl.toString();
    }
}
"board-app,superbar".split(',').forEach(id=>
    "dragover,drop".split(',').forEach(ev=>{
        var o=document.getElementById(id);if(o)addEventListener(ev,drop_time)
    })
)
