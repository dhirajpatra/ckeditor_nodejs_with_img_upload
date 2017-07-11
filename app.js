

// above other lib added for you application as well

var fs = require('fs');
var busboy = require('connect-busboy');
router.use(busboy());

var HOME_URL = 'http://localhost:3000';
var IMG_FOLDER = '/images/file/test/';

/*** image broser for ckeditor ***/
router.all('/browse_url', function (req, res) {
	var data = {};
	var dirname = process.cwd() + '/public/' + IMG_FOLDER;
	fs.readdir(dirname, function(err, filenames) {
		if (err) {
			return err;
		}
		var data = [];
		filenames.forEach(function(filename) {
			data.push({
				"image": HOME_URL + IMG_FOLDER + filename,
				"thumb": HOME_URL + IMG_FOLDER + filename,
				"folder": "Small"
			});
		});
		//console.log(data);
		res.send(data);
	});

});

/**
*
* For image upload from CKEditor
*/
router.post('/upload_url', function (req, res) {
	var fstream;
	var msg = "";
	var CKEcallback = req.query.CKEditorFuncNum;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename);
		//console.dir(file);
		fstream = fs.createWriteStream(process.cwd() + '/public/' + IMG_FOLDER + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			//res.redirect('back');
			var fileUrl =  process.cwd() + '/public/' + IMG_FOLDER + filename;
			fs.chmodSync(fileUrl, 0777);
			fileUrl = HOME_URL + IMG_FOLDER + filename;
			res.send("<script type='text/javascript'>\
      (function(){var d=document.domain;while (true){try{var A=window.parent.document.domain;break;}catch(e) {};d=d.replace(/.*?(?:\.|$)/,'');if (d.length==0) break;try{document.domain=d;}catch (e){break;}}})();\
      window.parent.CKEDITOR.tools.callFunction('" + CKEcallback + "','" + fileUrl + "', '" +  msg + "');\
      </script>");

		});

	});
});