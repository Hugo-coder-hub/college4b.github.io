define('app/core/stats/pageview/pubfilter',["require","exports"],function(e,t){function n(e){if(7===e.action.fromPlace&&9===e.action.toPlace)return!0}Object.defineProperty(t,"__esModule",{value:!0}),t.isCollectionOrReaderInteraction=function(e){if(3===e.action.toPlace)return!0;if(0===e.action.fromPlace&&7===e.action.toPlace)return!0;if(7===e.action.fromPlace&&0===e.action.toPlace)return!0;if(n(e))return!0;return!1},t.isReaderInteraction=n});
var FlashHeed = (function(window) {

    var document = window.document;

    var gsub = function(string, pattern, replacement) {
        var result = '', source = string, match;

        while (source.length > 0) {
            if (match = source.match(pattern)) {
                result += source.slice(0, match.index);
                result += replacement;
                source  = source.slice(match.index + match[0].length);
            } else {
                result += source, source = '';
            }
        }
        return result;
    };

    var heed = function(el) {
        if(el === undefined || el === null) var el = document;


        var objects = el.getElementsByTagName('object');
        var len = objects.length;
        var i;

        for(i = 0; i < len; i++) {
            var o = objects[i];
            var params = o.getElementsByTagName('param');
            var params_length = params.length;
            var embeds = o.getElementsByTagName('embed');
            var embed = null;
            if(embeds.length > 0) var embed = embeds[0];

            // Handle embed tag (for non-IE)
            if(embed) {
                // Need to set the embed wmode attribute
                // In this case, we need to remove and re-add the child node
                embed.setAttribute('wmode', 'transparent');
                var nx = embed.nextSibling, pn = embed.parentNode;
                pn.removeChild(embed);
                pn.insertBefore(embed, nx);
            }

            // Handle param tags (for IE)
            var correct_wmode_found = false;
            var incorrect_wmode_found = false;

            for(var j = 0; j < params_length; j++) {
                if(params[j].name === 'wmode') {
                    if(/transparent/i.test(params[j].value) || /opaque/i.test(params[j].value)) {
                        // an existing wmode with "transparent" or "opaque" is found
                        correct_wmode_found = true;
                    } else {
                        incorrect_wmode_found = true;
                    }
                }
            }

            if(!correct_wmode_found || incorrect_wmode_found) {
                var html = o.outerHTML;
                var nx = o.nextSibling, pn = o.parentNode;

                // Do a string replacement for a window param that IE injects be default to the innerhtml
                html = gsub(html, /<param name="wmode".*?>/i, '');

                // Add the correct transparent wmode param
                html = gsub(html, /<\/object>/i, '<PARAM NAME="WMode" VALUE="Transparent"></object>');

                // Totally remove the object tag from the dom
                pn.removeChild(o);

                // Add it to our new div, only to clobber it immediately.
                // This is the only way we've found to force IE to unrender the object.
                // We use a new container for this because you can't mess with the innerhtml
                // of an object tag. (throws a runtime error)
                var div = document.createElement("div");
                div.appendChild(o);
                div.innerHTML = '';

                // Update it with our new HTML that has the correct param tag
                div.innerHTML = html;

                // Finally, insert this new div back in the original spot
                pn.insertBefore(div, nx);
            }
        }
    }

    return {
        heed: heed
    }
})(window);
define("flashheed", function(){});

define('app/pub/pubengine',["require","exports","app/core/stats/pageview/track/trackerenums","app/core/stats/pageview/pubfilter","app/pub/pubhelper","app/pub/placeholder/placeholdermanager","flashheed"],function(e,s,i,t,o,a){var h;Object.defineProperty(s,"__esModule",{value:!0}),s.pubsimple=void 0,(h||(s.pubsimple={})).PubEngine=class{constructor(){this.adsHidden=!1}init(e){this.id=e,this.placeholderManager=a.placeholdermanager.get(this.sandbox),this.pubHelper=o.pubhelper.get(this.sandbox),this.listenToEvents(),this.sandbox.isAcademicUser()&&!this.sandbox.isPremiumUser()?this.showPromo(6):this.sandbox.isAnonymousMode()?this.showPromo(8):this.sandbox.isPremiumUser()||this.showPromo(7)}listenToEvents(){this.listenToPageViews(),this.listenToAdsToggle()}listenToAdsToggle(){this.sandbox.getEventBus().subscribeTo(35,12,e=>{this.adsHidden?(this.adsHidden=!1,this.sandbox.getEventBus().publish(35,13),this.refreshAds()):(this.adsHidden=!0,this.sandbox.getEventBus().publish(35,13))},this)}listenToPageViews(){i.isOldSystem()?(this.sandbox.getEventBus().subscribeToMultipleEvents(42,[55],()=>{this.onNewPageView()},this),this.sandbox.getEventBus().subscribeToMultipleEvents(42,[56],()=>{this.onNewPageView()},this)):this.sandbox.getEventBus().subscribeTo(35,2,e=>{t.isCollectionOrReaderInteraction(e)&&!t.isReaderInteraction(e)||this.updateUrlIfNeeded(),this.onNewPageView()},this)}updateUrlIfNeeded(){o.pubhelper.get(this.sandbox).replaceUrlIfNeeded(1)}onNewPageView(){this.handlePageView()}handlePageView(){this.adsHidden||this.sandbox.isPremiumUser()||this.refreshAds()}refreshAds(){this.sandbox.isPremiumUser()||this.showPromo()}showPromo(e){this.pubHelper.launchCb(),this.placeholderManager.showLargePromotion({color:0})}}});
define('app/pub/rectangle/rectangle',["require","exports","app/pub/pubengine"],function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0}),t.rectangle=void 0;{t=t.rectangle={};class n extends i.pubsimple.PubEngine{activate(e,t){this.init("right-column"),this.sandbox.getEventBus().publish(0,3,{moduleKey:this.moduleId,instanceId:this.instanceId})}deactivate(){}}t.Rectangle=n}});
