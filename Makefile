NAME=jetset-fe
CONTAINER_ID=$$(docker ps -a | grep $(NAME) | awk '{print $$(1)}')
IMAGES_ID=$$(docker images | grep -e 'jetset_frontend_jetset-fe' -e '<none>' | awk '{print $$(3)}' ORS=' ')

docker:
	cp docker-compose.dev.yml docker-compose.override.yml
up-docker:
	docker-compose up -d
down-docker:
	docker-compose down
restart-docker:
	make down-docker
	make up-docker

rebuild-docker:
	docker rm -f $(CONTAINER_ID)
	docker rmi $(IMAGES_ID)
	make up-docker
