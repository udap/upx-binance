#! /bin/bash
UI_NAME='upx-relay'

docker build -t $UI_NAME .
docker stop $UI_NAME || true && docker rm $UI_NAME || true
docker run -d -p 8090:8090 --rm --name $UI_NAME $UI_NAME
