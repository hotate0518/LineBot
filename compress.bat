cd %~dp0
del lambda.zip
"C:\Program Files\7-Zip\7z.exe" a lambda.zip node_modules index.js src
aws lambda update-function-code --function-name hotateFunc --zip-file fileb://lambda.zip