.PHONY: setup-linter dev stop create-dynamo-tables

setup-linter:
	# Install dependencies
	yarn install
	npx mrm lint-staged

clean:
	# Clean up node_modules and lock files
	rm -rf ./node_modules 
	rm -rf ./api/node_modules ./api/dist


create-dynamo-tables:
	./api/scripts/create-dynamo-tables.sh

# dev:
# 	mkdir -p ./dynamodb-local-data && \
# 	docker run -p 8000:8000 \
# 	-v ./dynamodb-local-data:/home/dynamodblocal/data amazon/dynamodb-local \
# 	-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data && \
# 	AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin

DOCKER_CONTAINER_NAME=dynamodb-local
DYNAMODB_PORT=8000
DYNAMO_ADMIN_PORT=8001
DYNAMODB_DATA_DIR=$(shell pwd)/dynamodb-local-data


dev:
	@echo "Cleaning up old DynamoDB container if exists..."
	@docker rm -f $(DOCKER_CONTAINER_NAME) 2>/dev/null || true

	@echo "Starting local dev environment..."
	concurrently --kill-others-on-fail \
		"docker run --rm --name $(DOCKER_CONTAINER_NAME) -p 8000:8000 -v $(DYNAMODB_DATA_DIR):/home/dynamodblocal/data amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data" \
		"PORT=8001 AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin" \
		"cd api && ./scripts/create-dynamo-tables.sh && PORT=3000 npm run start" \
		"cd webapp && PORT=3001 npm run start"

stop:
	@echo "Stopping local dev environment..."
	@docker rm -f $(DOCKER_CONTAINER_NAME) 2>/dev/null || true

clean: stop
	@echo "Cleaned up all services."