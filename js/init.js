window.reattach = {};
window.reattach.logReset = function(){
  $(".log").toggle("slow");
  $(".log").html("");
  $(".log").toggle("slow");
};
window.reattach.logAdd = function(msg){
  $('.log').append('<p>'+msg+'</p>')
};
window.reattach.start = function(){
  window.reattach.logReset()
  window.reattach.connect()
    .then(()=>{return window.reattach.getTransactionObjects(window.reattach.data.input,'bundles')})//assumed input is bundle, search txs
    .then( (transactionObjects) => {
      if(transactionObjects.length > 0)
        return Promise.resolve(transactionObjects)//fine, we have the bundle
      else {
        return window.reattach.getBundleHashFromTransactionHash(window.reattach.data.input)//assumed input is transaction, search bundle hash
          .then( (bundleHash) => {
            if(bundleHash)
              return window.reattach.getTransactionObjects(bundleHash,'bundles')//fine, we have bundle hash, search txs
            else
              return Promise.reject('address')//input isn't bundle hash, isn't tx hash, is address
          })
          .catch((error) => {
            if(error==='address')
              window.reattach.error('Invalid hash, you can find your transaction on <a target="_blank" href="https://thetangle.org/address/'+window.reattach.input+'">here</a>'+error)
            else
              window.reattach.error(error)
          })
      }
    })
    .then( (transactionObjects) => {
          window.reattach.data.bundle = transactionObjects
          window.reattach.logAdd('<h5>Bundle</h5> '+transactionObjects[0].bundle)
          return window.reattach.getStatus(transactionObjects)
    })
    .then()
    .catch((error) => {
      if(error==='address')
        window.reattach.error('Invalid hash, you can find your transaction on <a target="_blank" href="https://thetangle.org/address/'+window.reattach.input+'">here</a>'+error)
      else
        window.reattach.error(error)
    })
}

window.reattach.doReattach = function(bundle) {

}
window.reattach.getStatus = function(bundle) {
  var tails = bundle.filter((transactionObject)=>{
    return !transactionObject.currentIndex
  })
  var hashes = bundle.map((transactionObject)=>{
    return transactionObject.hash
  })
  return new Promise( (resolve,reject) => {
    window.iota.api.getLatestInclusion(hashes,(error,states) => {
      if(error) reject(error)
      else
        resolve(states.filter((state)=>{
          return state
        }))
    })
  })
}

window.reattach.connect = function(provider) {
  window.iota = new window.IOTA({
    provider: window.reattach.data.provider
  })
  return Promise.resolve(true)
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
  return new Promise( (resolve,reject) => {
    var search = {}
    search[inputType] = [input]
    window.iota.api.findTransactionObjects(search, (error,transactionObjects)=>{
    if(error) reject(error)
    else
      resolve(transactionObjects)
    })
  })
};

window.reattach.getBundleHashFromTransactionHash = function (input) {
  return new Promise( (resolve,reject) => {
    window.iota.api.getTransactionsObjects([input], (error,transactionObjects)=>{
      if(error) reject(error)
      else 
        if(transactionObjects.length > 0)
          resolve(transactionObjects[0].bundle)
        else
          resolve(false)
    })
  })
};

window.reattach.toggleInputDisables = function () {
  if($('input').attr('disabled')){
    $('input').removeAttr('disabled');
    $('.start button').removeAttr('disabled');
    $(".start").toggle("slow");
    $(".stop").toggle("slow");
  }else{
    $(".start").toggle("slow");
    $(".stop").toggle("slow");
    $('.start button').attr('disabled','disabled');
    $('input').attr('disabled','disabled');
  }
};

window.reattach.error = function(msg){
  window.reattach.logAdd(msg)
  window.reattach.toggleInputDisables()
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
      window.reattach.start()
    })

  }); // end of document ready
})(jQuery); // end of jQuery name space