FROM node:6
CMD ["/bin/bash"]
RUN mkdir myapp
WORKDIR /myapp
RUN npm install -g nodemon



