development:
	yarn
	docker-compose -f docker-compose.yml -f docker-compose.development.yml up

development-down:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml down
