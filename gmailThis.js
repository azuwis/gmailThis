// README:
// nnoremap <Leader>b :gmailthis -autosend -expandsendto -sendto user+kb@gmail.com -tags<Space>
// nnoremap <Leader>B :gmailthis -expandsendto -sendto user+kb@gmail.com -tags<Space>

// TODO:
// * add save2gmail_userprefix option - done, use -sendto option
// * change mapping to command, add bang or options to allow auto send - done
// * use readable when not selected anything
// * solve open in background problem - done

dactyl.plugins.gmailThis = {};

dactyl.execute("group! gmailThis");
dactyl.execute("autocmd! -javascript -group gmailThis PageLoad https://mail.google.com/mail/?view=cm&* dactyl.plugins.gmailThis.pasteAndGo();");

dactyl.plugins.gmailThis.savedHTML=null;
dactyl.plugins.gmailThis.pasteAndGo = function() {
    if (dactyl.plugins.gmailThis.savedHTML !== null) {
        // find first tab that has this url, TODO: has problem when opening multiple compose tabs
        let gmailTab = array.nth(tabs.allTabs, function (t) (t.linkedBrowser.lastURI || {}).spec.indexOf('https://mail.google.com/mail/?view=cm') === 0, 0);
        setTimeout(function () {
            let canvasDoc = gmailTab.linkedBrowser.contentDocument.getElementById('canvas_frame').contentDocument;
            let bodyDoc = canvasDoc.getElementById(':q9').contentDocument;
            bodyDoc.getElementById(":q9").innerHTML += dactyl.plugins.gmailThis.savedHTML;
            dactyl.plugins.gmailThis.savedHTML=null;
            //canvasDoc.getElementById(':q5').focus();
            if (dactyl.plugins.gmailThis.autosend) {
                // clink send button
                buffer.followLink(canvasDoc.getElementById(':q5'));
                // close gmail compose tab, display msg about sending result
                setTimeout(function () {
                    if (canvasDoc.getElementById("link_vsm")) {
                        tabs.remove(gmailTab, null, true);
                        dactyl.echo("Save2gmail: Success!");
                    } else {
                        dactyl.echoerr("Save2gmail: Failed!");
                    }
                }, 2000);
            }
        }, 2000);
    }
};

function gmailCompose(sendTo) {
    dactyl.plugins.gmailThis.savedHTML = "";
    let win = buffer.focusedFrame;
    let sel = win.getSelection();
    if (sel.rangeCount > 0) {
        let clone = sel.getRangeAt(0).cloneContents();
        let div = win.document.createElement('div');
        div.appendChild(clone);

        // convert img src to full path
        let imgs = div.getElementsByTagName("img");
        for (let i=0; i<imgs.length; i++) {
            if (imgs[i].getAttribute("src")) imgs[i].setAttribute("src", imgs[i].src);
        }

        // convert a href to full path
        let anchors = div.getElementsByTagName("a");
        for (let i=0; i<anchors.length; i++) {
            if (anchors[i].getAttribute("href")) anchors[i].setAttribute("href", anchors[i].href);
        }
        dactyl.plugins.gmailThis.savedHTML = div.innerHTML;
    } else {
        // use readable to get article, see http://readable.tastefulwords.com/
        //dactyl.open("javascript:(function(){_readableOptions={'text_font':'quote(Palatino%20Linotype),%20Palatino,%20quote(Book%20Antigua),%20Georgia,%20serif','text_font_monospace':'Inconsolata','text_font_header':'quote(Times%20New%20Roman),%20Times,%20serif','text_size':'20px','text_line_height':'1.5','box_width':'30em','color_text':'#282828','color_background':'#F5F5F5','color_links':'#EE4545','text_align':'normal','base':'blueprint','custom_css':''};if(document.getElementsByTagName('body').length>0);else{return;}if(window.$readable){if(window.$readable.bookmarkletTimer){return;}}else{window.$readable={};}window.$readable.bookmarkletTimer=true;window.$readable.options=_readableOptions;if(window.$readable.bookmarkletClicked){window.$readable.bookmarkletClicked();return;}_readableScript=document.createElement('script');_readableScript.setAttribute('src','http://readable-static.tastefulwords.com/target.js?rand='+encodeURIComponent(Math.random()));document.getElementsByTagName('body')[0].appendChild(_readableScript);})();");
        // TODO: get the resulting html after run the bookmarklet
        dactyl.plugins.gmailThis.savedHTML = "";
    }
    //let gmailurl = "javascript:(function(){var%20a=encodeURIComponent(location.href)+escape('\x0A'+'\x0A');var%20u='https://mail.google.com/mail/?view=cm&to='+encodeURIComponent('"+ encodeURIComponent(sendTo) +"')+'&ui=2&tf=0&fs=1&su='+encodeURIComponent(document.title)+'&body='+a;window.open(u,'gmail','height=540,width=640')})();void(0);";
    //dactyl.open(gmailurl);
    let gmailurl = "https://mail.google.com/mail/?view=cm&ui=2&tf=0&fs=1&shva=1&to=" + encodeURIComponent(sendTo) + "&su=" + encodeURIComponent(buffer.title) + "&body=" + encodeURIComponent(buffer.uri.spec) + escape('\x0A'+'\x0A');
    dactyl.open(gmailurl, {where: dactyl.NEW_TAB, background: true});
}

group.commands.add(["gmailthis"],
    "Save selected text or whole page to GMail",
    function (args) {
        let opts = {
            force: args.bang,
            unfiled: false,
            keyword: args["-keyword"] || null,
            charset: args["-charset"],
            post: args["-post"],
            tags: args["-tags"] || [],
            title: args["-title"] || (args.length === 0 ? buffer.title : null),
            url: args.length === 0 ? buffer.uri.spec : args[0]
        };

        let sendTo = args["-sendto"] || "";
        // add @gmail.com if email does not contain `@'
        if (sendTo !== "" && sendTo.indexOf("@") < 0) sendTo = sendTo + "@gmail.com";
        if (args["-expandsendto"] && opts.tags.length >0) {
            sendTo = sendTo.replace(/@/g, "+" + opts.tags.join("+") + "@");
        }

        // add this tag, so can find out bookmarked link sent to gmail or not
        opts.tags.push("gmailThis");

        // have to use global var, can not pass args to autocmds
        dactyl.plugins.gmailThis.autosend = (args["-autosend"] === true && sendTo !== "");

        if (args["-nobookmark"] !== true) {
            if (bookmarks.add(opts)) {
                let extra = (opts.title == opts.url) ? "" : " (" + opts.title + ")";
                dactyl.echomsg({ domains: [util.getHost(opts.url)], message: _("bookmark.added", opts.url + extra) },
                               1, commandline.FORCE_SINGLELINE);
            }
            else
                dactyl.echoerr(_("bookmark.cantAdd", opts.title.quote()));
        }

        gmailCompose(sendTo);
    }, {
        argCount: "?",
        bang: true,
        completer: function (context, args) {
            if (!args.bang) {
                context.title = ["Page URL"];
                let frames = buffer.allFrames();
                context.completions = [
                    [win.document.documentURI, frames.length == 1 ? "Current Location" : "Frame: " + win.document.title]
                    for ([, win] in Iterator(frames))];
                return;
            }
            completion.bookmark(context, args["-tags"], { keyword: args["-keyword"], title: args["-title"] });
        },
        options: [
            {
                names: ["-keyword", "-k"],
                description: "Keyword by which this bookmark may be opened (:open {keyword})",
                completer: function keyword(context, args) {
                    context.keys.text = "keyword";
                    return bookmarks.get(args.join(" "), args["-tags"], null, { keyword: context.filter, title: args["-title"] });
                },
                type: CommandOption.STRING,
                validator: function (arg) /^\S+$/.test(arg)
            },
            {
                names: ["-title", "-t"],
                description: "Bookmark page title or description",
                completer: function title(context, args) {
                    let frames = buffer.allFrames();
                    if (!args.bang)
                        return  [
                            [win.document.title, frames.length == 1 ? "Current Location" : "Frame: " + win.location.href]
                            for ([, win] in Iterator(frames))];
                    context.keys.text = "title";
                    context.keys.description = "url";
                    return bookmarks.get(args.join(" "), args["-tags"], null, { keyword: args["-keyword"], title: context.filter });
                },
                type: CommandOption.STRING
            },
            {
                names: ["-tags", "-T"],
                description: "A comma-separated list of tags",
                completer: function tags(context, args) {
                    context.generate = function () array(b.tags for (b in bookmarkcache) if (b.tags)).flatten().uniq().array;
                    context.keys = { text: util.identity, description: util.identity };
                },
                type: CommandOption.LIST
            },
            {
                names: ["-post", "-p"],
                description: "Bookmark POST data",
                completer: function post(context, args) {
                    context.keys.text = "post";
                    context.keys.description = "url";
                    return bookmarks.get(args.join(" "), args["-tags"], null, { keyword: args["-keyword"], post: context.filter });
                },
                type: CommandOption.STRING
            },
            {
                names: ["-charset", "-c"],
                description: "The character encoding of the bookmark",
                type: CommandOption.STRING,
                completer: function (context) completion.charset(context),
                validator: Option.validateCompleter
            },
            {
                names: ["-autosend"],
                description: "Auto send email"
            },
            {
                names: ["-nobookmark"],
                description: "Do not bookmark this link"
            },
            {
                names: ["-sendto"],
                description: "Email to send",
                type: CommandOption.STRING,
                validator: function (arg) /^\S+$/.test(arg)
            },
            {
                names: ["-expandsendto"],
                description: "Expand sendto with tags, resulting `user+taga+tagb...@domain'"
            }
        ]
    });

// vim: set et sw=4 ts=4 sts=4:
