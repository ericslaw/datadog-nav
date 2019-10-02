# datadog-nav
## Datadog Navigation via Bookmarklets
### Problem
Datadog has only very basic time navigation abilities.  Basically you can 
* move left+right a whole graph range (thus an anomaly at the edge of your graph will always be at the edge)
* drag-to-zoom-in but no zoom out (or even unzoom)
* date and hour picker, but is a bit clunky.

### Story
I often want to navigate to a time in the recent past and explore metrics.  I usually start with the last few hours or days and navigate 'left'.  When I find an area of interest it is sometimes right at the edge of the graph.  I can try zooming in then navigating left/right again but this is always imprecise.
After trying this I usually need to 'undo' the zoom, but that is not available.  Without 'unzoom', the next best option would be 'zoomout' by say, doubling the timerange.  This is not easily done either.

Inevitably I am no where near 'last day' at this point and have to use the custom navigator widget.  Trying to pick a whole day is quite possible, but requires much mousing around with the nav widget.

I also often want to select a short time-period around an anomaly but not have a custom zoom level every time I share it.  So snapping to hour boundaries (or day boundaries) would be really nice.


### Want, Need, Desire
* move left+right in fractions of the current graph range
* zoom out
* unzoom
* snap graph edges to hour or day boundaries

### Solution - bookmarklets?
A *bookmarklet* is a bookmarked link with a scheme of 'javascript:' which executes on the current page. See also https://en.wikipedia.org/wiki/Bookmarklet.

A *bookmarklet generator* should strip, minify, wrap, and uri-encode javascript into the bookmarklet form: `javascript:(function(){`your-code-here`})()`
This is the original generator I used, but it does not strip out comments: https://mrcoles.com/bookmarklet/
I have not found any generator that auto-inserts semicolons where needed (such as when defining prototype assignments).

### Evolution
#### Time manipulation functions; move, zoom, snap
First I needed some functions that can move a timestamp around.
While the URL params can be in any order (and frankly the arguments could have many names depending on the tool you are using),
I scan for anything that looks like an epoch-second (or msec) and calculate the average.
This usually ends up being the mid-point in the timerange on the graph.
Using this as a reference, any OTHER timestamp in the URL can be deemed as to the left or the right of this midpoint,
thus providing a clue as to which direction to modify the timestamp.

Snapping is a wee bit more complex, as it is easy to push either side of the graph to the same snap point.
A little extra logic on when to push the right-side out a little farther is required.

Debugging via chrome console is nice, so I extended the base String object with a function that expands epoch sec/msec into a human readable string.
This function is called when() and is chainable (it only logs to console; it does not modify the string).

#### Streamlining
Pasting chunks of javascript into a bookmarklet generator tool is fine, but what if you want a dozen of them?  It is very time consuming.
So I wrapped the code in a script that strips comments, minifies, and url encodes the result wrapped in the bookmarklet structure,
and even spits out html anchor links for each that can be drag-n-dropped into your bookmark toolbar in chrome.

### Bugs
I initially had some issues with move_pct and noticed I was not casting math results back to int, thus introducing decimals into timestamps.
I also found I was using incorrect multipliers in zoom_pct that swapped timestamps (I was using -1 instead of 2)

### Premade examples
see http://htmlpreview.github.com/?https://github.com/ericslaw/datadog-nav/blob/master/bmgen.html
