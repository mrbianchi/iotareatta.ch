window.reattach = {};

window.reattach.connect = function(provider) {
  window.iota = new window.IOTA({
    provider: provider
  })
}

window.reattach.collectOptions = function() {
  window.reattach.data = {}
  window.reattach.data.input = $("#hash").val()
  window.reattach.data.provider = $("#customNodeCheckbox").prop('checked') ? $("#customNodeInput").val() : $("select").val()
  window.reattach.data.remotePoW = $("#remotePoWCheckbox").prop('checked')
  window.reattach.data.reattach = $("#reattachCheckbox").prop('checked')
  window.reattach.data.promote = $("#promoteCheckbox").prop('checked')
};

window.reattach.getTransactionObjects = function (input,inputType) {
  return new Promise( (resolveChild,rejectChild) => {
    window.iota.api.findTransactionObjects({inputType:[input]}, (error,transactionObjects)=>{
    if(error) reject(error)
    else
      if(transactionObjects.length>0)
        return resolve(transactionObjects)
    })
  })
};

window.reattach.getBundleFromTransactionHash = function (input) {
  return new Promise( (resolve,reject) => {
    window.iota.api.getTransactionsObjects([input], (error,transactionObjects)=>{
      if(error) reject(error)
      else 
        if(transactionObjects.length > 0) {
          resolve(transactionObject[0].bundle)
        }else{
          resolve(false)
        }
    })
  })
};

window.reattach.getBundleFromBundleHash = function (input){
  return getTransactionObjects(input,'bundles')
};

window.reattach.toggleInputDisables = function () {
  $('input').attr('disabled','disabled');
};

(function($){
  $(function(){
    // Things from template
    $('.sidenav').sidenav();
    $('.parallax').parallax();

    // NodeList/CustomNode toggle stuff
    $('#customNodeCheckbox').change(function(){
      $("#nodeListArea").toggle("slow");
      $("#customNodeArea").toggle("slow");
    })

    // Get nodes from json and append to select
    $.getJSON( "/iota.dance.json", function( nodes ) {
      window.withRemotePoWAvailable = nodes.filter(function(node){
        return node.pow
      })
      var onlyLocalPoW = nodes.filter(function(node){
        return !node.pow
      })
      if(window.withRemotePoWAvailable.length > 0) {
        $("#nodeListArea select").append('<optgroup label="Remote PoW Available"></optgroup>')
        window.withRemotePoWAvailable.forEach(function(node){
          $("#nodeListArea select optgroup:eq(0)").append('<option value="'+node.node+'">'+node.node+'</option>')
        })
      }
      if(onlyLocalPoW.length > 0) {
        $("#nodeListArea select").append('<optgroup label="Only Local PoW"></optgroup>')
        onlyLocalPoW.forEach(function(node){
          $("#nodeListArea select optgroup:eq(1)").append('<option value="'+node.node+'">'+node.node+'</option>')
        })
      }
      var elem = document.querySelector('select');
      var instance = M.FormSelect.init(elem, {});
  
      $('select').change(function(){
        var nodeSelected = $(this).val();
        var found = window.withRemotePoWAvailable.filter( function(node){
          return (nodeSelected === node.node) ? true : false
        })
        if(found.length) {
          $("#remotePoWCheckbox").removeAttr('disabled');
          $("#remotePoWCheckbox").prop('checked',true);
        } else {
          $("#remotePoWCheckbox").prop('checked',false);
          $("#remotePoWCheckbox").attr('disabled','disabled');
        }
      })
      $('select').trigger('change')
    })

    $(".start").click(function(){
      window.reattach.collectOptions()
      window.reattach.toggleInputDisables()
    })

  }); // end of document ready
})(jQuery); // end of jQuery name space