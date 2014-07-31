function list($scope, $http){

  /* List all timeseries */
  $scope.list = [];
  $scope.filter = '';
  $http.get('/timeseries?limit=18').success(function(data) { $scope.list = data; });
  
  /* Search timeseries */
  $scope.search = function(){
    $http.get('/timeseries/?limit=18&q=' + $scope.filter).
      success(function(data, status, headers, config) {
        $scope.list = data;
      }).
      error(function(data, status, headers, config) {
        $scope.status = "Error listing timeseries from database!";
      });     
  }

  $scope.cannotLoadMore = function(){
    return $scope.list.length < 18;
  }
  
  $scope.loadmore = function(){
    /* List all timeseries */
    var q = $scope.filter || '';
    var s = $scope.list.length || 0;
    $http.get('/timeseries?q=' + q + '&skip=' + s + '&limit=18')
      .success(function(data) { $scope.list = $scope.list.concat(data);});
  }
  
  $scope.trigger = function(data){
    console.log('Angular: got ' + data);
    var timeseries = data.match(/\/timeseries\/([a-zA-Z0-9]+)/)[1] || "";
    if($scope.list.indexOf(timeseries)){
      console.log('match found! need to update graph in list...');
      dygraph(timeseries + '.graph', timeseries);
    }
  }
}

// $resource gebruiken!!!
// of gebruik: https://www.npmjs.org/package/angoose

function model($scope, $http){
    
  // Start with zero features in model
  $scope.listY = [];
  $scope.y = '';
  $scope.yOk = false;
  $scope.features = [];
  $scope.featureNew = '';
  $scope.listNew = [];
  
  // Initiate input fields...
  $http.get('/timeseries').
    success(function(data, status, headers, config) {
      $scope.listY   = data;      
      $scope.listNew = data;      
    }).
    error(function(data, status, headers, config) {
      $scope.status = "Error listing timeseries from database!";
    });

  // Check if user may OK the new Y value
  $scope.hideOkY = function(){
    return $scope.yOk;
  }
  
  $scope.OkYDisabled = function(){
    if ($scope.yExists) return false;
    else return true;
  }
  
  $scope.hideRemoveY = function(){
    return !$scope.yOk;
  }
  
  // Change Y
  $scope.checkY = function(){
    
    if ($scope.y.length > 0) {
      $http.get('/timeseries/' + $scope.y + '/_id').
        success(function(data, status, headers, config) {      
          if (data) $scope.yExists = true;
          else      $scope.yExists = false;
        }).
        error(function(data, status, headers, config) {
          $scope.status = "Error listing timeseries from database!";
        });      
    } else $scope.yExists = false;

    $http.get('/timeseries/?q=' + $scope.y ).
      success(function(data, status, headers, config) {
        $scope.listY = data;
        if($scope.listY.length == 1) {
          $scope.y =  $scope.listY[0]._id;
          $scope.yExists = true;
        }
      }).
      error(function(data, status, headers, config) {
        $scope.status = "Error listing timeseries from database!";
      });   
  }
  
  // Select from listY
  $scope.selectY = function(id){
    $scope.y = id;
    $scope.checkY();
  }
  
  // Definitely select Y
  $scope.okY = function(){
    $scope.yOk = true;
    $scope.autoSave();
  }

  // Delete feature
  $scope.removeY = function(index){
    $scope.yOk = false;
    $scope.y = '';
    $scope.checkY();
  }
  
  // Disable input
  $scope.inputYDisabled = function(){
    return $scope.hideOkY();
  }

  
  
  
  
  
  
  // Check if user may add new feature  
  $scope.addNewDisabled = function(){
    if ($scope.featureNewExists) return false;
    else return true;
  }

  // Add a new feature
  $scope.addNew = function(){
    $scope.features.push({ _id: $scope.featureNew });
    $scope.autoSave();
    $scope.featureNew = '';
    $scope.checkNew();
  }
  
  // Change feature
  $scope.checkNew = function(){
    if ($scope.featureNew.length > 0) {
      $http.get('/timeseries/' + $scope.featureNew + '/_id').
        success(function(data, status, headers, config) {      
          if (data) $scope.featureNewExists = true;
          else      $scope.featureNewExists = false;
        }).
        error(function(data, status, headers, config) {
          $scope.status = "Error listing timeseries from database!";
        });      
    } else $scope.featureNewExists = false;

    $http.get('/timeseries/?q=' + $scope.featureNew ).
      success(function(data, status, headers, config) {
        $scope.listNew = data;
        if($scope.listNew.length == 1) {
          $scope.featureNew =  $scope.listNew[0]._id;
          $scope.featureNewExists = true;
        }
      }).
      error(function(data, status, headers, config) {
        $scope.status = "Error listing timeseries from database!";
      });
  }
  
  // Select from listNew
  $scope.selectNew = function(id){
    $scope.featureNew = id;
    $scope.checkNew();
  }

  // Delete feature
  $scope.removeFeature = function(index){
    $scope.features.splice(index, 1);
    if ($scope.features.length > 0) {
      $scope.autoSave();
    }
  }
  
  
  
  
  
  // Check if we can save
  $scope.saveDisabled = function(){
    if ($scope.features.length > 0 && $scope.yExists && $scope.yOk) return false;
    else return true;
  }
  
  $scope.computeDisabled = function(){
    return $scope.saveDisabled();
  }
  
  //$resource gebruiken van Angular!
  
  $scope.autoSave = function(){
    if (!$scope.saveDisabled()) {
      $scope.save();
      $scope.compute();
    }
  }
  
  // Save model
  $scope.save = function(){
    var y = $scope.y;
    var X = [];
    angular.forEach($scope.features, function(value, key){ this.push(value._id); }, X);
    var m = {
      "y": y,
      "X": X
    };

    $http.put('/models/model001', m).
      success(function(data, status, headers, config) {
        $scope.status = 'Saved model...';
      }).
      error(function(data, status, headers, config) {
        $scope.status = 'Warning: could not save model! (' + status + ')';
      }); 
  }
  
  // Compute
  $scope.compute = function(){
    $http.get('/models/model001/compute').
      success(function(data, status, headers, config) {
        $scope.status = 'computed model (' + status + ')';
      }).
      error(function(data, status, headers, config) {
        $scope.status = 'failed to compute model (' + status + ')';
      }); 
  }
}

function TimeseriesController($scope, $http){
  dygraph($scope.object._id + '.graph', $scope.object._id);  
}
