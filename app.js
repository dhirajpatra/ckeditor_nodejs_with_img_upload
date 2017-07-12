

// above other lib added for you application as well

var fs = require('fs');
var busboy = require('connect-busboy');
router.use(busboy());

/* For AWS S3
var s3 = require('s3');

var client = s3.createClient({
	maxAsyncS3: 20,     // this is the default
	s3RetryCount: 3,    // this is the default
	s3RetryDelay: 1000, // this is the default
	multipartUploadThreshold: 20971520, // this is the default (20 MB)
	multipartUploadSize: 15728640, // this is the default (15 MB)
	s3Options: {
		accessKeyId: "your key",
		secretAccessKey: "your secret key",
		region: "us-east-1",
	},
});*/

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

/*** image upload for ckeditor with S3
router.all('/browse_url', function (req, res) {
	var data = {};
	var data = [];
	s3browseFiles(function (filenames) {
		filenames.forEach(function(filename) {
			data.push({
				"image": filename,
				"thumb": filename,
				"folder": "Small"
			});
		});

		//console.log(data);
		res.send(data);
	});

});*/

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

/*
* For S3 upload
router.post('/upload_url', function (req, res) {
	var fstream;
	var msg = "";
	var CKEcallback = req.query.CKEditorFuncNum;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename);
		//console.dir(file);
		fstream = fs.createWriteStream(process.cwd() + '/public/images/file/test/' + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			//res.redirect('back');
			var fileUrl =  process.cwd() + '/public/images/file/test/' + filename;
			fs.chmodSync(fileUrl, 0777);

			// need to upload to S3
			var uploadResult = s3uploads(fileUrl); //console.log(uploadResult);

			//fileUrl = HOME_URL + '/images/file/test/' + filename;
			fileUrl = uploadResult;

			//fs.unlinkSync(fileUrl);

			res.send("<script type='text/javascript'>\
      (function(){var d=document.domain;while (true){try{var A=window.parent.document.domain;break;}catch(e) {};d=d.replace(/.*?(?:\.|$)/,'');if (d.length==0) break;try{document.domain=d;}catch (e){break;}}})();\
      window.parent.CKEDITOR.tools.callFunction('" + CKEcallback + "','" + fileUrl + "', '" +  msg + "');\
      </script>");

		});

	});
});*/

/**
 * This will upload file to S3
 */
function s3uploads(filePath){

	var localFile = filePath;
	// return res.json({ success: true, message: localFile });

	var onlyFileName = localFile.split("/");
	var fname = (onlyFileName[onlyFileName.length - 1]);

	var params = {
		localFile: localFile,

		s3Params: {
			Bucket: "best-templates",
			Key: "static-pages/"+fname,
			ACL: 'public-read',
			CacheControl: 'max-age=31536000',
			Expires: new Date || 'Wed Dec 31 2099 16:00:00 GMT-0800 (PST)'
			|| 123456789,
		},
	};

	var uploader = client.uploadFile(params);
	uploader.on('error', function(err) {
		console.error("unable to upload:", err.stack);
	});
	uploader.on('progress', function() {
		console.log("progress", uploader.progressMd5Amount,
			uploader.progressAmount, uploader.progressTotal);
	});
	uploader.on('end', function() {
		console.log("done uploading");

	});

	return 'https://s3.amazonaws.com/best-templates/static-pages/'+fname;
}

/**
 * this will browse files for s3 folder of static pages images
 * @returns {Array}
 */
function s3browseFiles(callback){

	var keys = [];
	var list = [];
	// // return res.json({ success: true, message: localFile });

	var params = {
		s3Params: {
			Bucket: "best-templates",
			MaxKeys: 10000000,
			Prefix: "static-pages/",
		},
	};

	var uploader = client.listObjects(params);
	uploader.on('error', function(err) {
		console.error("unable to upload:", err.stack);
	});
	uploader.on('data', function(data) {
		list = data["Contents"];
	});

	uploader.on('end', function() {

		for (var i = 1; i < list.length; i++) {
			for (var prop in list[i]){
				if (prop == 'Key'){
					//console.log(list[i][prop]);
					keys.push('https://s3.amazonaws.com/best-templates/'+list[i][prop]);
				}
			}
		}

		//console.log(keys);
		callback(keys);

	});

}
