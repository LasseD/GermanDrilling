let glb = 0;

var port = chrome.runtime.connect({name: "germanDrill"});

function injectParentNode(node, replacements) {
    node = node.get(0);

    if(node.nodeType == 3) {
        injectTextNode(node, replacements);
    }
    else { // Try direct children:
        const children = node.childNodes;
        for(let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeType == 3) {
                injectTextNode(child, replacements);
            }
        }
    }
}

function injectTextNode(node, replacements) {
    let txt = node.textContent;
    let words = txt.split(/\b/);
    let ret = document.createElement('span');
    let anyReplacements = false;

    let buffer = '';
    function close() {
        if(!buffer) {
            return; // No text to append.
        }
        let textNode = document.createTextNode(buffer);
        ret.appendChild(textNode);
        buffer = '';
    }
    function addTxt(txt) {
        buffer += txt;
    }
    function addNode(node) {
        close();
        ret.appendChild(node);
    }

    for(let i = 0; i < words.length; i++) {
        let word = words[i];
        if(!replacements.hasOwnProperty(word)) {
            addTxt(word);
            continue;
        }
        let id = 'german_drilling_' + glb++;
        let box = document.createElement('span');
        box.className = "germanDrillBox";
        box.id = id;

        let choices = replacements[word];
        let alt = choices[Math.floor(Math.random()*choices.length)];

        function build(correct, txt) {
            let ret = document.createElement('span');
            ret.textContent = txt;
            ret.className = "germanDrillOption";
            ret.onclick = function() {
                port.postMessage({attempt:correct});
                box.innerHTML = word;
                box.className = 'germanDrill' + (correct?'Correct':'Wrong');
            };
            
            return ret;
        }
        
        let rand = Math.random() < 0.5;
        box.appendChild(document.createTextNode('('));
        box.appendChild(build(rand, rand ? word : alt));
        box.appendChild(document.createTextNode(' '));
        box.appendChild(build(!rand, !rand ? word : alt));
        box.appendChild(document.createTextNode(')'));

        addNode(box);
        anyReplacements = true;
    }

    if(anyReplacements) { // Shield due to slow function:
        close();
        node.replaceWith(ret);
    }
}

function loadRules(lines) {
    let replacementRules = {};

    function loadParts(parts) {
        for(let i = 0; i < parts.length; i++) {
            // Rotate parts:
            parts.push(parts.shift());

            let key = parts[0];
            let values = []; values.push(...parts); values.shift();
	    replacementRules[key] = values;
        }
    }
    
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
	let parts = line.split(' ').filter(x => !!x);
        console.log('Loading line', line);
        loadParts(parts);

        // Ensure upper-case versions also work:
        parts = parts.map(x => x[0].toUpperCase() + x.substring(1));
        loadParts(parts);
    }

    //console.dir(replacementRules);

    $('.mw-parser-output p, .mw-parser-output ul li').contents().each(function(){ injectParentNode($(this), replacementRules); });
}

chrome.storage.sync.get(['rules'], function(items) {
    let rules = items.rules;
    if(!rules) {
        rules = "der die das"; // Backup!
        console.warn('Failed to load grammar rules. Using simple der/dir/das backup!');
    }
    loadRules(rules.split('\n'));
});
