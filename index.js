const AWS = require('aws-sdk');
var s3 = new AWS.S3();
var multipart = require("parse-multipart");

exports.handler = async (event, context, callback) => {
    
    
    if(event.method == 'POST') {
        var bodyBuffer = Buffer.from(event['bodyjson'].toString(),'base64');
        var boundary = multipart.getBoundary(event.params.header['content-type']);
    
        var parts = multipart.Parse(bodyBuffer, boundary);
        
        console.log(parts);
        
        var filePath = "images/" + parts[0].filename;
         var params = {
           "Body": parts[0].data,
           "Bucket": "test-bucket-tri",
           "Key": filePath,
           "ContentType": parts[0].type,
           "acl":'public-read'
        };
        // for some reaseon ACL not uploading the image to s3
        // need to be verified later
        
        console.log(params);
        
        console.log(s3);
        
        s3.upload(params, function(err, data){
          if(err) {
              return {status:false, message:"unable to upload file", err: err};
          } else {
              return {status:true, message:"file uploaded", data: data};
        }
        });
        
        var paramsImage = { "Bucket": "test-bucket-tri","Key": filePath };
        var signedUrl = s3.getSignedUrl('getObject',paramsImage);
      
    
        callback(null,{ result: 'SUCCESS',method: event.method, filePath:filePath, signedUrl:signedUrl });    
    }
    else if(event.method == 'GET') {
        
        var image = event.params.querystring.name;
        var paramsImage = { "Bucket": "test-bucket-tri","Key": image };
        var signedUrl = s3.getSignedUrl('getObject',paramsImage);
        
        callback(null,{ result: 'SUCCESS', event:event, method: event.method, filePath:filePath, signedUrl:signedUrl });       
    }
  
  
};
