// debugging epochms into iso format - spews to console but is chainable
String.prototype.when = function(){
    this.replace(
        /\d{10,13}/g,
        m => {
            console.log(
                m.substr(0,10),
                ' ',
                new Date( parseInt(m.substr(0,10),10)*1000 - (new Date().getTimezoneOffset()*60*1000) ) .toISOString().replace('Z','')
            )
        }
    );
    return this
};  // is assignment, not just function declaration
