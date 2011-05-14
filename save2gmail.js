dactyl.plugins.save2gmail = {};
dactyl.plugins.save2gmail.focusSend = function() {
    setTimeout(function () {
        content.document.getElementById('canvas_frame').contentWindow.document.getElementById(':q5').focus();
    }, 2000);
};

dactyl.plugins.save2gmail.paste = function() {
    if(dactyl.plugins.save2gmail.savedHTML) {
        let canvasDoc = content;
        setTimeout(function () {
            canvasDoc = canvasDoc.document.getElementById('canvas_frame').contentWindow.document;
            //canvasDoc = buffer.getElementById('canvas_frame').contentWindow.document;
            canvasDoc.getElementById(':q9').contentWindow.document.getElementById(":q9").innerHTML += dactyl.plugins.save2gmail.savedHTML;
            //dactyl.plugins.save2gmail.savedHTML=null;
            canvasDoc.getElementById(':q5').focus();
        }, 2000);
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
                    //dactyl.plugins.save2gmail.savedHTML=div.innerHTML;
                    //dactyl.plugins.save2gmail.savedHTML=new XMLSerializer().serializeToString(clone);
                    dactyl.plugins.save2gmail.savedHTML='<a href="http://www.britblog.com/"><img src="data:image/gif;base64,R0lGODlhUAAPAKIAAAsLav///88PD9WqsYmApmZmZtZfYmdakyH5BAQUAP8ALAAAAABQAA8AAAPbWLrc/jDKSVe4OOvNu/9gqARDSRBHegyGMahqO4R0bQcjIQ8E4BMCQc930JluyGRmdAAcdiigMLVrApTYWy5FKM1IQe+Mp+L4rphz+qIOBAUYeCY4p2tGrJZeH9y79mZsawFoaIRxF3JyiYxuHiMGb5KTkpFvZj4ZbYeCiXaOiKBwnxh4fnt9e3ktgZyHhrChinONs3cFAShFF2JhvCZlG5uchYNun5eedRxMAF15XEFRXgZWWdciuM8GCmdSQ84lLQfY5R14wDB5Lyon4ubwS7jx9NcV9/j5+g4JADs=" alt="British Blog Directory" width="80" height="15" /></a>';
alert(dactyl.plugins.save2gmail.savedHTML);
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
