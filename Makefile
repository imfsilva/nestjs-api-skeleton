development:
	yarn
	docker-compose -f docker-compose.yml -f docker-compose.development.yml up

development-down:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml down

development-config-seed:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn seed:config

development-seed: development-schema-drop development-schema-sync
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn seed:dev

development-schema-sync:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn schema:sync:dev

development-schema-drop:
	docker-compose -f docker-compose.yml -f docker-compose.development.yml exec server yarn schema:drop:dev

staging:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

staging-down:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml down

staging-seed: staging-schema-drop staging-schema-sync
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml exec server yarn seed:stag

staging-schema-sync:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml exec server yarn schema:sync:stag

staging-schema-drop:
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml exec server yarn schema:drop:stag
