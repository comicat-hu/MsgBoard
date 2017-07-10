# MsgBoard

A message board practice.

use nodejs, express, docker, mongodb.	

--


### MongoDB

- db = msgdb

- collections = post(s)

--

### Page Url


- Host: 127.0.0.1

- Port: 3000


- Index: /

- New post: /new

- Posts list: /list/:page

- Read post: post/:postId

- Edit post: edit/:postId

- Remove post by unlink(key) data


--

### How to active

docker-compose build

docker-compose up


--

### Docker Hub

[Docker Image](https://hub.docker.com/r/comi/msgboard/)  (dev use node:6)



