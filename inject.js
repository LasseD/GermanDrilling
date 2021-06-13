let glb = 0;

function inject(node, replacements) {
    let txt = node.text();
    let words = txt.split(/\b/);
    let ret = '';
    let anyReplacements = false;
    
    for(let i = 0; i < words.length; i++) {
        let word = words[i];
        if(!replacements.hasOwnProperty(word)) {
            ret += word;
            continue;
        }        
        let id = 'german_drilling_' + glb++;
        ret += '<span class="germanDrillBox" id="' + id + '">(';

        let choices = replacements[word];
        let alt = choices[Math.floor(Math.random()*choices.length)];

        let a = "<span class=\"germanDrillOption\" onclick=\"document.dispatchEvent(new CustomEvent('GermanDrillCorrect'));$('#" + id + "').text('" + word + "').addClass('germanDrillCorrect');\">" + word + "</span>";

        let b = "<span class=\"germanDrillOption\" onclick=\"document.dispatchEvent(new CustomEvent('GermanDrillWrong'));$('#" + id + "').text('" + word + "').addClass('germanDrillWrong');\">" + alt + "</span>";

        if(Math.random() < 0.5) {
            ret += b + ' ' + a;
        }
        else {
            ret += a + ' ' + b;
        }

        ret += ')</span>';
        anyReplacements = true;
    }

    if(anyReplacements) { // Shield due to slow function:
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

    $('.mw-parser-output p, .mw-parser-output ul li').contents().each(function(){ inject($( this ), replacementRules); });
}

chrome.storage.sync.get(['rules'], function(items) {
    let rules = items.rules;
    if(!rules) {
        rules = "der die das"; // Backup!
        console.warn('Failed to load grammar rules. Using simple der/dir/das backup!');
    }
    loadRules(rules.split('\n'));
});
