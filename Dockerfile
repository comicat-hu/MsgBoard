FROM node:6
RUN mkdir myapp
WORKDIR /myapp
RUN npm install -g nodemon
#ADD ./package.json /myapp
#RUN npm install
#CMD ["npm","install"]
#CMD ["npm","start"]



