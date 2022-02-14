development:
	yarn
	docker-compose -f docker-compose.yml -f docker-compose.development.yml up

development-down:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml down

development-config-seed:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn seed:config

development-seed:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn seed:run

development-schema-sync:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn schema:sync

development-schema-drop:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn schema:drop

staging:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

staging-down:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml down

staging-seed:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml exec server yarn seed:run
