# mushroom-quiz

## what's this?
A quiz for the mushrooms of Hungary.

## deployed app url
https://ignotus87.github.io/mushroom-quiz/

## known issues

We're using the experimental import json ECMAscript feature.
It works with the assert keyword for some browsers while others accept the with keyword only.
Need to find a cross-browser solution asap.

## users' manual

This website contains test materials for mushroom species.


## tests/quizes
 * select the correct name out of 4, by the image of a species, with a means to redo last round's mistakes

# development

## start local web server

You'll need node.js.

Installing the Node.js http-server is simple.

npm install http-server -g

This will install the http-server package globally. Now we can start the server to serve the files in the current directory.

http-server . -p 8000
