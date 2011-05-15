// TODO:
// * add save2gmail_userprefix option
// * change mapping to command, add bang or options
// * use readable when not selected anything
// * solve open in background problem

dactyl.plugins.save2gmail = {};

dactyl.plugins.save2gmail.paste = function() {
    if(dactyl.plugins.save2gmail.savedHTML) {
        let canvasDoc = content.document;
        //let canvasDoc = buffer.doc;
        setTimeout(function () {
            canvasDoc = canvasDoc.getElementById('canvas_frame').contentWindow.document;
            canvasDoc.getElementById(':q9').contentWindow.document.getElementById(":q9").innerHTML += dactyl.plugins.save2gmail.savedHTML;
            dactyl.plugins.save2gmail.savedHTML=null;
            canvasDoc.getElementById(':q5').focus();
        }, 5000);
    }
};

dactyl.execute("group! save2gmail");
dactyl.execute("autocmd! -group save2gmail DOMLoad https://mail.google.com/mail/?view=cm&* :js dactyl.plugins.save2gmail.paste();");

group.mappings.add([modes.NORMAL], ["<Leader>b"],
    "Bookmark to GMail",
    function () {

        let options = {};

        let url = buffer.uri.spec;
        let bmarks = bookmarks.get(url).filter(function (bmark) bmark.url == url);
        let to = "azuwis+kb";

        if (bmarks.length == 1) {
            let bmark = bmarks[0];

            options["-title"] = bmark.title;
            options["-tags"] = [];
            if (bmark.charset)
                options["-charset"] = bmark.charset;
            if (bmark.keyword)
                options["-keyword"] = bmark.keyword;
            if (bmark.post)
                options["-post"] = bmark.post;
            if (bmark.tags.length > 0) {
                options["-tags"] = bmark.tags;
                let i = bmark.tags.indexOf("saved2gmail");
                let tags = bmark.tags.slice(0,i).concat(bmark.tags.slice(i+1));
                to = to + "+" + tags.join("+");
            }
            to = encodeURIComponent(to + "@gmail.com");
            //if (bmark.tags.indexOf("saved2gmail") < 0) {
            if (true) {
                options["-tags"].push("saved2gmail");
                //dactyl.execute(":feedkeys <M-c>");
                let win = buffer.focusedFrame;
                //let win = document.commandDispatcher.focusedWindow;
                //if (win == window)
                //    win = this.focusedFrame;
                let sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    let clone = sel.getRangeAt(0).cloneContents();
                    var div = win.document.createElement('div');
                    div.appendChild(clone);

                    // convert img src to full path
                    let imgs = div.getElementsByTagName("img");
                    for (let i=0; i<imgs.length; i++) {
                        imgs[i].setAttribute("src", imgs[i].src);
                    }

                    // convert a href to full path
                    let anchors = div.getElementsByTagName("a");
                    for (let i=0; i<anchors.length; i++) {
                        if (anchors[i].getAttribute("href")) anchors[i].setAttribute("href", anchors[i].href);
                    }
                    dactyl.plugins.save2gmail.savedHTML=div.innerHTML;
                    //dactyl.plugins.save2gmail.savedHTML=new XMLSerializer().serializeToString(clone);
                }
                dactyl.execute(":" + commands.commandToString({ command: "bmark", options: options, arguments: [buffer.uri.spec] }));
                dactyl.open("http://mail.google.com/mail/?view=cm&ui=2&tf=0&fs=1&shva=1&to=" + to + "&su=" + encodeURIComponent(buffer.title) + "&body=" + encodeURIComponent(url) + escape('\x0A'+'\x0A'), dactyl.NEW_TAB);
                //dactyl.execute(":js window.open('http://mail.google.com/mail/?view=cm&ui=2&tf=0&fs=1&shva=1&to=" + to + "&su=" + encodeURIComponent(buffer.title) + "&body=" + encodeURIComponent(url) + escape('\x0A'+'\x0A') + "','gmail','height=540,width=640');");
                //dactyl.open("javascript:(function(){var%20a=encodeURIComponent(location.href)+escape('\x0A'+'\x0A');var%20u='http://mail.google.com/mail/?view=cm&to='+encodeURIComponent('"+ to +"')+'&ui=2&tf=0&fs=1&su='+encodeURIComponent(document.title)+'&body='+a;window.open(u,'gmail','height=540,width=640')})();void(0);");
            }
        } else {
            if (buffer.title != buffer.uri.spec)
                options["-title"] = buffer.title;
            if (content.document.characterSet !== "UTF-8")
                options["-charset"] = content.document.characterSet;
            CommandExMode().open(
                commands.commandToString({ command: "bmark", options: options, arguments: [buffer.uri.spec] }) + " -tags ");
        }
    });

// vim: set et sw=4 ts=4 sts=4:
