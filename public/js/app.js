const app = angular.module('app', ['ngRoute']);

app.config(['$locationProvider', function ($locationProvider) {
	$locationProvider.hashPrefix('');
	$locationProvider.html5Mode(true);
}]);

app.config(function ($routeProvider) {
	$routeProvider.otherwise({
		redirectTo: '/'
	});
});

app.controller("mainCtrl", function () {});


app.directive('headerBlock', function () {
	return {
		replace: true,
		templateUrl: 'templates/header.html',		
		controller: function ($scope, $http) {
			
			
		}
	}
});


app.directive('recipesBlock', function () {
	return {
		replace: true,
		templateUrl: 'templates/recipes.html',		
		controller: function ($scope, $http) {
			$scope.recipeStatus = true;
			
            $http.get('http://localhost:9480/recipes').then(function successCallback(response) {
                $scope.recipesArr = response.data;
            }, function errorCallback(response) {
                console.log("Error!!!" + response.err);
            });
            
            
            $scope.addNewBookStatus = false;
            $scope.addRecipeBtn = function () {
                 $scope.recipeStatus = false;
				$scope.addNewRecipeItemBlock = true;
            };
			
			
			$scope.chooseRecipe = function (index, name, indexArr, recipeSrc){
				let beforeCountChanges = recipeSrc.split("-");
                $scope.editRecipeItemStatus = false;
                $scope.indexOfItem = index;
				
				
				$http.get('http://localhost:9480/recipes-info').then(function successCallback(responce) {
					$scope.recipesInfoText = responce.data;
					$scope.recipeStatus = false;
					$scope.chosenRecipeItem = true;
					$scope.chosenRecipeItemName = name;
					$scope.chosenRecipeItemSrc = recipeSrc;
					$scope.chosenRecipeItemDescription = $scope.recipesInfoText[indexArr];
				}, function errorCalback(response) {
					console.log("Error!!!" + response.err);
				});
				
				 $scope.changeSatusImgUpload = function () {
                    $scope.statusImgUpload = true;
                };				
				 
				$scope.editRecipeItem = function () {
					$scope.editRecipeItemStatus = true;
					$scope.newNameOfTheRecipeItem = $scope.chosenRecipeItemName;
					$scope.newInfoOfTheRecipeItem = $scope.chosenRecipeItemDescription;
					$scope.newRecipeItemSrc = $scope.chosenRecipeItemSrc; 
				};
				
				$scope.deleteRecipeItem = function () {
					$http.delete('http://localhost:9480/recipe/' + index).then(function successCallback() {
					console.log("Deleted!");
						
						$scope.recipesInfoText.splice(indexArr, 1);
						
						let obj = {
							text:$scope.recipesInfoText.join('/item/')
						};
						
						$http.put('http://localhost:9480/recipes-info', obj).then(function successCallback() {
							console.log("Updated text in txt file");
							$http.get('http://localhost:9480/recipes').then(function successCallback(response) {
								$scope.recipesArr = response.data;
								$scope.recipeStatus = true;
								$scope.chosenRecipeItem = false;
								$scope.chosenRecipeItemName = "";
							});
							
						}, function errorCallback(response) {
                                    console.log("Error!!!" + response.err);
						});
						
				},function errorCallback(response) {
                            console.log("Error!!!" + response.err);
                });
				}
			
				$scope.closeChangeBlock = function () {
					$scope.editRecipeItemStatus = false;
				}			
				
				var newArrImg = "";
				$scope.acceptChanges = function () { 
							
					if($scope.statusImgUpload) {
						var fd = new FormData();
						if(beforeCountChanges[1] == undefined) {
							newArrImg = recipeSrc + "-" + $scope.countChanges;
						} else {
							$scope.countChanges += Number(beforeCountChanges[1]);
							newArrImg = beforeCountChanges[0] + "-" + $scope.countChanges;
						};
						fd.append(newArrImg, $scope.myFile);
						
						$http.post('http://localhost:9480/images', fd, {       
								transformRequest: angular.identity,
                                headers: {
                                    'Content-Type': undefined
                                }
                            })
                            .then(function successCallback() {
                                console.log("Uploaded!");
                            }, function errorCallback(response) {
                                console.log("Error!!!" + response.err);
                            });		
					
					};
					
					$scope.recipesInfoText[indexArr] = $scope.newInfoOfTheRecipeItem;
										
					let obj = {
						text: $scope.recipesInfoText.join('/item/')
					};
										
					$http.put('http://localhost:9480/recipes-info', obj).then(function successCallback() {
						 console.log("Updated text in txt file");
                        }, function errorCallback(response) {
                            console.log("Error!!!" + response.err);
                      });
					
					 $scope.countChanges += Number(beforeCountChanges[1]);
                    if ($scope.statusImgUpload) {
                        var objEdit = {
                            name: $scope.newNameOfTheRecipeItem,
                            src: newArrImg
                        }
                    } else {
                        var objEdit = {
                            name: $scope.newNameOfTheRecipeItem,
                            src: recipeSrc
                        }
                    }
					
					$http.post('http://localhost:9480/recipes-edit/' + $scope.indexOfItem, objEdit)
                        .then(function successCallback() {
                            console.log("Edited");
                        }, function errorCallback(response) {
                            console.log("Error!!!" + response.err);
                        });
					
					
                    $http.get('http://localhost:9480/recipes')
                        .then(function successCallback(response) {
                            $scope.recipesArr = response.data;
                            $scope.chosenRecipeItemName = $scope.newNameOfTheRecipeItem;
                            $scope.chosenRecipeItemDescription = $scope.newInfoOfTheRecipeItem;
                            if ($scope.statusImgUpload) {
                                $scope.chosenRecipeItemSrc = newArrImg;
                            } else {
                                $scope.chosenRecipeItemSrc = recipeSrc;
                            };
                            $scope.statusImgUpload = false;
                            $scope.editRecipeItemStatus = false;
                        }, function errorCallback(response) {
                            console.log("Error!!!" + response.err);
                        });
					
				}
			};
			
			$scope.backToTheRecipeList = function () {
				$scope.recipeStatus = true;
				$scope.chosenRecipeItem = false;
				$scope.chosenRecipeItemName = "";
			}
		}
	}
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive('addRecipeBlock', function () {
	return {
		replace: true
		, templateUrl: 'templates/addRecipe.html'
		, controller: function ($scope, $http) {
			$scope.nameOfNewRecipe = "";
			$scope.recipeDescription = "";
			
			$scope.addNewRecipeItem = function () {
				
				var imgNumName = 0;
				if($scope.recipesArr[0] == undefined) {
					imgNumName = 1;
				} else {
					imgNumName = $scope.recipesArr[$scope.recipesArr.length - 1].id + 1;
				};
				var fd = new FormData();
				fd.append(imgNumName, $scope.myFile);
				
				$http.post('http://localhost:9480/images', fd, {
					 transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
				}).then(function successCallback() {
					  console.log("Uploaded!");
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
				
				let obj = {
					text: $scope.recipeDescription
				};
				
				$scope.now = new Date();
				
				$http.post('http://localhost:9480/recipes-info', obj).then(function successCallback() {
				 console.log("Text in txt file");
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
				
				let obj2 = {
					name: $scope.nameOfNewRecipe,
					src: imgNumName,
					date: $scope.now
				};
				
				$http.post('http://localhost:9480/recipes', obj2).then(function successCallback() {
                        console.log("Data in DB");
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
				
				$http.get('http://localhost:9480/recipes').then(function successCallback(response){
					$scope.recipesArr = response.data;
					$scope.recipeStatus = true;
					$scope.nameOfNewRecipe = "";
					$scope.recipeDescription = "";
					
				}, function errorCallback(response) {
					console.log("Error!!!" + response.err);
				});
				
				$scope.addNewRecipeItemBlock = false;
				
			}
			
			$scope.backFromAddRecipe = function () {
			   $scope.recipeStatus = true;
				$scope.addNewRecipeItemBlock = false;
				$scope.nameOfNewRecipe = "";
				$scope.recipeDescription = "";
			}			
						
		}
	}
});

