function dragenter(event){
  //console.log(document.getElementById(event.srcElement.id))
};

function dragstart(event){
  //console.log(event.srcElement.id + ' is being dragged ...');
  //$("#" + event.srcElement.id).hide();
  var data = event.target.id;
  event.dataTransfer.setData("Text", data);
  //console.log(event);
};

function drop(event){
  $("#" + event.target.id).focus();
  event.preventDefault();
  var data = event.dataTransfer.getData("Text");
  event.target.value = data;
};
