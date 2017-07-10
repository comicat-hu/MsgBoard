A message board practice.

use nodejs, express, docker, mongodb.


-----mongoDB-----


db = msgdb, collections = post(s)



-----url-----


Host: 127.0.0.1

Port: 3000



Index: /

New post: /new

Posts list: /list/:page

Read post: post/:postId

Edit post: edit/:postId

Remove post by unlink(key) data




[docker image](https://hub.docker.com/r/comi/msgboard/)  (dev use node:6)


-----docker ins-----

docker-compose build


docker-compose up


