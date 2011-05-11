group.mappings.add([modes.NORMAL], ["<Leader>b"],
    "Bookmark to GMail",
    function () {

        let options = {};

        let url = buffer.uri.spec;
        let bmarks = bookmarks.get(url).filter(function (bmark) bmark.url == url);
        let to = "azuwis+kb+";

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
                to = to + tags.join("+") + "@gmail.com";
            }
            to = encodeURIComponent(to);
            if (bmark.tags.indexOf("saved2gmail") < 0) {
                options["-tags"].push("saved2gmail");
                dactyl.execute(":feedkeys <M-c>");
                dactyl.execute(":" + commands.commandToString({ command: "bmark", options: options, arguments: [buffer.uri.spec] }));
                //dactyl.open("http://mail.google.com/mail/?view=cm&ui=2&tf=0&fs=1&shva=1&to=" + to + "&su=" + encodeURIComponent(buffer.title) + "&body=" + encodeURIComponent(url) + escape('\x0A'+'\x0A'), dactyl.NEW_TAB);
                dactyl.open("javascript:(function(){var%20a=encodeURIComponent(location.href)+escape('\x0A'+'\x0A');var%20u='http://mail.google.com/mail/?view=cm&to='+encodeURIComponent('"+ to +"')+'&ui=2&tf=0&fs=1&su='+encodeURIComponent(document.title)+'&body='+a;if(u.length>=2048){window.alert('Please%20select%20less%20text');return;}window.open(u,'gmail','height=540,width=640')})();void(0);");
            }
        } else {
            if (buffer.title != buffer.uri.spec)
                options["-title"] = buffer.title;
            if (content.document.characterSet !== "UTF-8")
                options["-charset"] = content.document.characterSet;
            CommandExMode().open(
                commands.commandToString({ command: "bmark", options: options, arguments: [buffer.uri.spec] }) + " -tags ");
        }
        //dactyl.open("javascript:(function(){var%20a=encodeURIComponent(location.href)+escape('\x0A'+'\x0A')+encodeURIComponent((!!document.getSelection)?document.getSelection():(!!window.getSelection)?window.getSelection():document.selection.createRange().text);var%20u='http://mail.google.com/mail/?view=cm&to="+ to +"&ui=2&tf=0&fs=1&su='+encodeURIComponent(document.title)+'&body='+a;if(u.length>=2048){window.alert('Please%20select%20less%20text');return;}window.open(u,'gmail','height=540,width=640');console.debug(a)})();void(0);");
    });
