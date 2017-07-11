/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.extraPlugins = 'imagebrowser';
    config.imageBrowser_listUrl = "/admin/browse_url";

    //config.extraPlugins = 'imageuploader';

    config.extraPlugins = 'filebrowser';
    config.language = 'en';
    config.fillEmptyBlocks = false;

    // Simplify the dialog windows.
    config.removeDialogTabs = 'image:advanced;link:advanced';
};
