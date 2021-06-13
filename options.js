// Saves options to chrome.storage
function save_options() {
  var v = document.getElementById('grammarRules').value;
  chrome.storage.sync.set({
      rules: v
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
      rules: "der die das des den dem\n" +
          "ein eine eines einer einen einem\n"
  }, function(items) {
      document.getElementById('grammarRules').value = items.rules;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
