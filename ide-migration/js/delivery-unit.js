/*
 * Copyright (c) 2010-2021 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2010-2021 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
migrationLaunchView.controller('DeliveryUnitViewController', ['$scope', '$http', '$messageHub', function ($scope, $http, $messageHub) {
    $scope.isVisible = false;
    $scope.duDropdownDisabled = true;
    $scope.duDropdownText = "---Please select---";
    $scope.workspacesDropdownText = "---Please select---";
    $scope.workspaces = [];
    $scope.workspacesList = $scope.workspaces;
    $scope.deliveryUnits = [];
    $scope.deliveryUnitList = $scope.deliveryUnits;
    $scope.dataLoaded = false;
    let selectedDeliveyUnit = undefined;
    let selectedWorkspace = undefined;
    let descriptionList = [
        "Please wait while we get all delivery units...",
        "Provide the target workspace and delivery unit"
    ];
    $scope.descriptionText = descriptionList[0];
    let connectionId = undefined;
    let processId = undefined;
    let neoData = undefined;
    let hanaData = undefined;
    let defaultErrorTitle = "Error loading delivery units";
    let defaultErrorDesc = "Please check if the information you provided is correct and try again.";

    function getDUData() {
        body = {
            neo: neoData,
            hana: hanaData
        }

        $http.post(
            "/services/v4/js/ide-migration/server/migration/api/migration-rest-api.js/start-process",
            JSON.stringify(body),
            { headers: { 'Content-Type': 'application/json' } }
        ).then(function (response) {
            processId = body.processInstanceId = response.data.processInstanceId;
            const timer = setInterval(function(){
              $http.post(
                          "/services/v4/js/ide-migration/server/migration/api/migration-rest-api.js/get-process",
                          JSON.stringify(body),
                          { headers: { 'Content-Type': 'application/json' } }
                      ).then(function (response) {
                          if (response.data.workspaces && response.data.deliveryUnits && response.data.connectionId) {
                                        clearInterval(timer);
                                        connectionId = response.data.connectionId;
                                        $scope.workspaces = response.data.workspaces;
                                        $scope.workspacesList = $scope.workspaces;
                                        $scope.deliveryUnits = response.data.deliveryUnits;
                                        $scope.deliveryUnitList = $scope.deliveryUnits;
                                        $scope.$parent.setBottomNavEnabled(true);
                                        $scope.descriptionText = descriptionList[1];
                                        $scope.dataLoaded = true;
                          }
                      }, function (response) {})
            }, 1000);

        }, function (response) {
            if (response.data) {
                if ("error" in response.data) {
                    if ("message" in response.data.error) {
                        $messageHub.announceAlertError(
                            defaultErrorTitle,
                            response.data.error.message
                        );
                    } else {
                        $messageHub.announceAlertError(
                            defaultErrorTitle,
                            defaultErrorDesc
                        );
                    }
                    console.error(`HTTP $response.status`, response.data.error);
                } else {
                    $messageHub.announceAlertError(
                        defaultErrorTitle,
                        defaultErrorDesc
                    );
                }
            } else {
                $messageHub.announceAlertError(
                    defaultErrorTitle,
                    defaultErrorDesc
                );
            }
            errorOccurred();
        });
    };

    function errorOccurred() {
        $scope.$parent.previousClicked();
        $scope.$parent.setBottomNavEnabled(true);
    }

    $scope.filterDU = function () {
        if ($scope.duSearch) {
            let filtered = [];
            for (let i = 0; i < $scope.deliveryUnits.length; i++) {
                if ($scope.deliveryUnits[i].name.toLowerCase().includes($scope.duSearch.toLowerCase())) {
                    filtered.push($scope.deliveryUnits[i]);
                }
            }
            $scope.deliveryUnitList = filtered;
        } else {
            $scope.deliveryUnitList = $scope.deliveryUnits;
        }
    };

    $scope.filterWorkspaces = function () {
        if ($scope.workspacesSearch) {
            let filtered = [];
            for (let i = 0; i < $scope.workspaces.length; i++) {
                if ($scope.workspaces[i].toLowerCase().includes($scope.workspacesSearch.toLowerCase())) {
                    filtered.push($scope.workspaces[i]);
                }
            }
            $scope.workspacesList = filtered;
        } else {
            $scope.workspacesList = $scope.workspaces;
        }
    };

    $scope.workspaceSelected = function (workspace) {
        selectedWorkspace = workspace;
        $scope.workspacesDropdownText = workspace;
        $scope.duDropdownDisabled = false;
    };

    $scope.duSelected = function (deliveryUnit) {
        selectedDeliveyUnit = deliveryUnit;
        $scope.duDropdownText = deliveryUnit.name;
        $scope.$parent.setFinishEnabled(true);
    };

    $messageHub.on('migration.delivery-unit', function (msg) {
        if ("isVisible" in msg.data) {
            $scope.$apply(function () {
                $scope.dataLoaded = false;
                $scope.duDropdownDisabled = true;
                $scope.duDropdownText = "---Please select---";
                $scope.workspacesDropdownText = "---Please select---";
                $scope.descriptionText = descriptionList[0];
                $scope.isVisible = msg.data.isVisible;
                if (msg.data.isVisible) {
                    if (selectedDeliveyUnit) {
                        $scope.$parent.setFinishEnabled(true);
                    } else {
                        $scope.$parent.setFinishEnabled(false);
                    }
                    $scope.$parent.setBottomNavEnabled(false);
                    $scope.$parent.setPreviousVisible(true);
                    $scope.$parent.setPreviousEnabled(true);
                    $scope.$parent.setNextVisible(false);
                    $scope.$parent.setFinishVisible(true);
                }
            });
            if (msg.data.isVisible) {
                $messageHub.message('migration.neo-credentials', { controller: "migration.delivery-unit", getData: "all" });
                $messageHub.message('migration.hana-credentials', { controller: "migration.delivery-unit", getData: "all" });
            }
        }
        if ("neoData" in msg.data) {
            neoData = msg.data.neoData;
        }
        if ("hanaData" in msg.data) {
            hanaData = msg.data.hanaData;
            getDUData();
        }
        if ("getData" in msg.data) {
            if (msg.data.getData === "all") {
                $messageHub.message(msg.data.controller, {
                    duData: {
                        "processId": processId,
                        "connectionId": connectionId,
                        "workspace": selectedWorkspace,
                        "du": selectedDeliveyUnit,
                    }
                });
            }
        }
    }.bind(this));
}]);
