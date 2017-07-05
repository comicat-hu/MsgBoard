A message board practice.

use nodejs, express, docker, mongodb.


db = msgdb, collections = post(s)


-----url-----


index: localhost:3000/

new post: /new

posts list: /list/:page

post: post/:postId

edit: edit/:postId

------------


remove post by unlink(key)




docker image: https://hub.docker.com/r/comi/msgboard/ (dev use node:6)


-----npm script-----


npm run start-mongo-docker


(run a mongoDB and volume data/db)



npm run start-dev-docker

(run a node6 with nodemon expose port 3000)


