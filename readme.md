8/27 
I set up webpack by using the documentation on the webpack website. 

https://webpack.js.org/guides/getting-started/

The site can be viewed on the python server set up within the dist/ folder

I run npx webpack in the console (project folder) to dynamically create the main.js file which is updated in the /dist folder and displayed on the webpage being served at localhost through python

in /src and root folders
index.js --> compiled using webpack.config.js -->main.js

in /dist folder
main.js --> called through <script> in --> index.html