'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['pasvaz.bindonce','myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers','myApp.compiles'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
