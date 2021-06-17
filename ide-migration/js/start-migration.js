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
migrationLaunchView.controller('StartMigrationViewController', ['$scope', '$messageHub', function ($scope, $messageHub) {
    $scope.isVisible = false;
    $scope.migrationFinished = false;
    $scope.progressBarPercentage = 10;
    let titleList = [
        "Configuration processing, starting the migration...",
        "Migration complete"
    ]
    $scope.progressTitle = titleList[0];

    $scope.migrationDone = function () {
        $scope.migrationFinished = true;
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    $messageHub.on('migration.start-migration', function (msg) {
        if ("isVisible" in msg.data) {
            $scope.$apply(function () {
                $scope.isVisible = msg.data.isVisible;
            });
            if (msg.data.isVisible) {
                sleep(1000).then(() => { $scope.$apply(function () { $scope.progressBarPercentage = 25; }); });
                sleep(2000).then(() => { $scope.$apply(function () { $scope.progressBarPercentage = 40; }); });
                sleep(3000).then(() => { $scope.$apply(function () { $scope.progressBarPercentage = 75; }); });
                sleep(4000).then(() => { $scope.$apply(function () { $scope.progressBarPercentage = 90; }); });
                sleep(6000).then(() => { $scope.$apply(function () { $scope.progressBarPercentage = 100; }); });
                sleep(7000).then(() => {
                    $scope.$apply(function () {
                        $scope.migrationFinished = true;
                        $scope.progressTitle = titleList[1];
                    });
                });
            }
        }
    }.bind(this));
}]);