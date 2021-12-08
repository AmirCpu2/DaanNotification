var targetWindow = null;

function NorificationManager(prefix) {
    var nurl = {}, nbtns = {}, ncounter = 0;
    function id() {
        return prefix + (ncounter++);
    }
    function create(title, message, options) {
        var nid = id();
        var opts = {
            type: "basic",
            title: title,
            message: message,
            iconUrl: "icon128.png"
        };
        nurl[nid] = options.url;
        nbtns[nid] = options.buttons;
        if (options.buttons) {
            opts.buttons = [];
            for (var i = 0; i < options.buttons.length; i++) {
                opts.buttons[i] = { title: options.buttons[i].title };
                options.buttons[i].iconUrl && (opts.buttons[i].iconUrl = options.buttons[i].iconUrl);
            }
        }
        chrome.notifications.create(
            nid,
            opts,
            function (notificationId) { }
        );
        return nid;
    }
    function remove(notificationId) {
        chrome.notifications.clear(notificationId, function () { });
        delete nurl[notificationId];
        delete nbtns[notificationId];
    }
    chrome.notifications.onClicked.addListener(function (notificationId) {
        if (nurl.hasOwnProperty(notificationId)) {
            nurl[notificationId] && window.open(nurl[notificationId]);
            remove(notificationId);
        }
    });
    chrome.notifications.onButtonClicked.addListener(function (notificationId, index) {
        if (nbtns.hasOwnProperty(notificationId)) {
            var b = nbtns[notificationId][index];
            b.url && window.open(b.url);
            (typeof (b.onclick) == 'function') && b.onclick(notificationId, index);
            remove(notificationId);
        }
    });
    return {
        create: create,
        remove: remove
    }
}

var i = 0;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    try{
        console.log(request.message);

        //check for fcuse tab
        chrome.windows.getCurrent(function (win) {
            targetWindow = win;
        });
    
        // alert(targetWindow.state=='minimized');
    
        // alert(targetWindow.focused);
    
        // alert(request.whiteBoardIsFullScreen);
    
        //میخوای بگیم م.اقعی که کاربر صفحه رو میبینه و داخل وایتبرد نیست پیام ارسال نکن
        if ( targetWindow.focused == true && request.whiteBoardIsFullScreen == false)
        {
            chrome.notifications.getAll((items) => {
                if ( items ) {
                    for (let key in items) {
                        chrome.notifications.clear(key);
                    }
                }
              });
            return 0;
        }
    
        var _notificationManager = new NorificationManager(`sample-prefix-${i++}`);	//prefix must be unique
    
        //----------------------
        var options = {
            url: "",	//(optional) Click-to-open URL
            buttons: [	//(optional) button
                { title: "بستن همه", onclick: function (notificationId, index) { 
                    
                    chrome.notifications.getAll((items) => {
                        if ( items ) {
                            for (let key in items) {
                                chrome.notifications.clear(key);
                            }
                        }
                      });

                 } },
                { title: "رفتن به چت", url: `${request.url}` }	//button item: onclick or url
            ]
        };
        var _notificationManager = nman.create(request.name, request.message, options);
    }
    catch(e){
        console.log(e);
    }
    
})

// Set up a click handler so that we can merge all the windows.
chrome.browserAction.onClicked.addListener(function (re, res, resf) {
    
    var nman = new NorificationManager(`sample-prefix-${i++}`);	//prefix must be unique

    //----------------------
    var options = {
        url: "",	//(optional) Click-to-open URL
        buttons: [	//(optional) button
            { title: "بستن همه", onclick: function (notificationId, index) { 
                    
                chrome.notifications.getAll((items) => {
                    if ( items ) {
                        for (let key in items) {
                            chrome.notifications.clear(key);
                        }
                    }
                  });
                  
             } },
            { title: "بعدا پاسخ میدم", onclick: function (notificationId, index) { 
                document.querySelector('#message-input').parentElement.querySelector('button').click()
            } }
        ]
    };
    var nid = nman.create("AmirCpu", "Description Message", options);
});

// chrome.windows.