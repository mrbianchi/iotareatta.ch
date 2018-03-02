String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second parm
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) {
      hours = "0" + hours;
  }
  if (minutes < 10) {
      minutes = "0" + minutes;
  }
  if (seconds < 10) {
      seconds = "0" + seconds;
  }
  var time = /*hours + ':' + */minutes + ':' + seconds;
  return time;
}
window.reattach = {};
window.reattach.timers = new Array()
window.reattach.timer = function(index) {
  if(typeof window.reattach.timers[index] === 'undefined') return;
  var temp = window.reattach.timers[index].count.toHHMMSS();
  window.reattach.timers[index].count = (parseInt(window.reattach.timers[index].count) - 1).toString();
  $("#"+window.reattach.timers[index].selector).html(temp);
  if (parseInt(window.reattach.timers[index].count) < 0) {
    clearInterval(window.reattach.timers[index].interval);
  window.reattach.timers[index].callback()
  }
}

window.reattach.createCountdown = function(callback,seconds) {
  window.reattach.timers.push({
    selector: 'timer-'+Math.round(+new Date()/1000) + new Date().getTime(),
    count: seconds.toString(),
    interval: setInterval(window.reattach.timer, 1000, window.reattach.timers.length),
    callback: callback
  })
  return '<span id="'+window.reattach.timers.slice(-1).pop().selector+'"></span>'
}


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
    .then(()=>{
      if(window.reattach.data.input.length === 90)
        return window.reattach.getTransactionObjects(window.iota.utils.noChecksum(window.reattach.data.input),'addresses')
          .then((transactionObjects)=>{
            return Promise.resolve(['address',transactionObjects])
          })
          .catch((error)=>{return Promise.reject(error)})
      else if(window.reattach.data.input.substr(window.reattach.data.input.length - 3) === '999')
        return window.reattach.getBundleHashFromTransactionHash(window.reattach.data.input)
          .then((bundleHash)=>{
            return window.reattach.getTransactionObjects(bundleHash,'bundles')
              .then((transactionObjects)=>{
                return Promise.resolve(['transaction',transactionObjects])
              })
              .catch((error)=>{Promise.reject})//error
          })
          .catch((error)=>{return Promise.reject(error)})//error
      else
        return window.reattach.getTransactionObjects(window.reattach.data.input,'addresses')
          .then( (transactionObjects) => {
            if(transactionObjects.length)
              return Promise.resolve(['address',transactionObjects])
            else
              return window.reattach.getTransactionObjects(window.reattach.data.input,'bundles')
                .then((transactionObjects)=>{
                  return Promise.resolve(['bundle',transactionObjects])
                })
                .catch((error)=>{return Promise.reject(error)})//isnt address, transaction or bundle
          })
          .catch((error)=>{return Promise.reject(error)})//error with the node
    })
    .then((data)=>{
      var inputType = data[0],
          transactionObjects = data[1]
      if(inputType==='address'){
        return Promise.reject('address')
      }else{
        //normal progress
        return Promise.resolve(transactionObjects)
      }
    })
    .then( (transactionObjects) => {
          window.reattach.data.bundle = transactionObjects
          window.reattach.logAdd('<h5>Bundle</h5> <a target="_blank" href="https://thetangle.org/bundle/'+transactionObjects[0].bundle+'">'+transactionObjects[0].bundle+'</a>')
          return window.reattach.getStatus(transactionObjects)
    })
    .then( (status) => {
      if(status.length) {
        window.reattach.logAdd('<h6 class="status confirmed">Confirmed</h6>')
        return Promise.reject('confirmed')
      } else {
        window.reattach.logAdd('<h6 class="status unconfirmed">Unconfirmed - '+window.reattach.createCountdown(function(){alert('hola')},60)+'</h6><hr>')
        
        return window.reattach.doReattach()
      }
    })
    .then( (success) => {
      if(success) {
        window.reattach.logAdd('<h6>Reattached</h6> <a target="_blank" href="https://thetangle.org/transaction/'+success[0].hash+'">'+success[0].hash+'</a>')
        window.reattach.data.tailObjects.push(success[0])
        return window.reattach.doPromote(success[0].hash)
      }else{
        return window.reattach.doPromote()
      }
    })
    .then( (success) => {
      if(success) {
        window.reattach.logAdd('')
      }else{
        window.reattach.logAdd('Verifying on..2')
      }
    })
    .catch((error) => {
      switch(error) {
        case 'confirmed':
          window.reattach.error()
        break;
        case 'address':
          window.reattach.error('You entered an <strong>address</strong>, can find your bundle or transaction hash on a tangle explorer like <a target="_blank" href="https://thetangle.org/address/'+window.reattach.data.input+'">that</a>')
        break;
        case 'Error: Request Error: Invalid bundles input':
          window.reattach.error('Invalid transaction')
        break;
        default:
          window.reattach.error(error)
        break;
      }
    })
}

window.reattach.doReattach = function(bundle) {
  if(window.reattach.data.reattach === false)
    return Promise.resolve(false)
  else
    return new Promise( (resolve,reject) => {
      window.iota.api.replayBundle(window.reattach.data.tailObjects[0].hash, 3, 14, (error,success) => {
        if(error) reject(error)
        else resolve(success)
      })
    })
}

window.reattach.doPromote = function(tailHash) {
  if(!window.reattach.data.promote)
    return Promise.resolve(false)
  if(typeof tailHash === 'undefined')
    var tailHash = window.reattach.data.input()
  return new Promise( (resolve,reject) => {
    var count = 0
    window.reattach.data.promoteID = Math.round(+new Date()/1000) + new Date().getTime()
    window.reattach.logAdd('<h6>Promoted <span id="counter-'+window.reattach.data.promoteID+'">0</span>/'+(window.reattach.data.tailObjects[0].lastIndex+1)+'</h6>')
    window.iota.api.promoteTransaction(tailHash, 3, 14, [{
      address: 'REATTACH9DOT9ONLINE99999999999999999999999999999999999999999999999999999999999MRB',
      tag: 'REATTACHDOTONLINE',
      message: window.iota.utils.toTrytes('http://IOTAReatta.ch - IOTA Reattacher/Promoter'),
      value: 0
    }],{
      delay:1000,
      interrupt: () => {
          $('#counter-'+window.reattach.data.promoteID).text(++count)
          return count >= (window.reattach.data.tailObjects[0].lastIndex+1);
      }
    }, (error,result) => {
      if(error) reject(error)
      else resolve(true)
    })
  })
}

window.reattach.getStatus = function(bundle) {
  window.reattach.data.tailObjects = bundle.filter((transactionObject)=>{
    return !transactionObject.currentIndex
  })
  var hashes = window.reattach.data.tailObjects.map((tailObject)=>{
    return tailObject.hash
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
    window.iota.api.getTransactionsObjects([input], (error,transactionsObject)=>{
      if(error) reject(error)
      else resolve(transactionsObject[0].bundle)
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
  if(typeof msg !== 'undefined')
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