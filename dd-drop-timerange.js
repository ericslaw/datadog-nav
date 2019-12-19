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
document.getElementById('board-app') .addEventListener('dragover',drop_time);
document.getElementById('board-app') .addEventListener('drop',drop_time);
