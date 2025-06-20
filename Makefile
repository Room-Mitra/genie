.PHONY: setup-linter dev stop create-dynamo-tables

setup-linter:
	# Install dependencies
	yarn install
	npx mrm lint-staged

clean:
	# Clean up node_modules and lock files
	rm -rf ./node_modules 
	rm -rf ./EC2/node_modules ./EC2/dist


create-dynamo-tables:
	./EC2/scripts/create-dynamo-tables.sh

# dev:
# 	mkdir -p ./dynamodb-local-data && \
# 	docker run -p 8000:8000 \
# 	-v ./dynamodb-local-data:/home/dynamodblocal/data amazon/dynamodb-local \
# 	-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data && \
# 	AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin

DOCKER_CONTAINER_NAME=dynamodb-local
DYNAMODB_PORT=8000
DYNAMO_ADMIN_PORT=8001


dev: 
	# Remove old container if it exists
	@echo "Removing old DynamoDB Local container if it exists..."
	@docker rm -f $(DOCKER_CONTAINER_NAME)  2>/dev/null || true


	@echo "Starting DynamoDB Local in Docker..."
	@docker run -d --rm \
		--name $(DOCKER_CONTAINER_NAME)  \
		-p $(DYNAMODB_PORT):8000 \
		-v $$PWD/dynamodb-local-data:/home/dynamodblocal/data \
		amazon/dynamodb-local \
		-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data

	@echo "Waiting for DynamoDB to be ready..."
	@sleep 2

	@echo "Creating tables if they don't exist..."
	./EC2/scripts/create-dynamo-tables.sh & \
		CREATE_PID=$$!

	@echo "Starting dynamodb-admin..."
	@DYNAMO_ENDPOINT=http://localhost:$(DYNAMODB_PORT) \
		PORT=$(DYNAMO_ADMIN_PORT) \
		AWS_REGION=ap-south-1 \
		AWS_ACCESS_KEY_ID=local \
		AWS_SECRET_ACCESS_KEY=local \
		dynamodb-admin &

	@echo "Starting backend (Express)..."
	@cd EC2 && npm start & \
	BACKEND_PID=$$!

	@echo "Starting frontend (React)..."
	@cd webapp && PORT=3001 npm start & \
	FRONTEND_PID=$$!

	@echo "All services started. Press Ctrl+C to stop." && \
	@trap 'echo "\nStopping all services..."; \
		docker stop $(DOCKER_CONTAINER_NAME); \
		kill $$CREATE_PID $$ADMIN_PID $$BACKEND_PID $$FRONTEND_PID 2>/dev/null || true; \
		exit 0' INT; 
	wait

stop:
	@echo "Stopping all services..."
	@docker stop $(DOCKER_CONTAINER_NAME)
	@pkill -f "npx dynamodb-admin" || true
	@pkill -f "node scripts/create-tables.js" || true
	@pkill -f "npm run dev" || true
	@pkill -f "npm start" || true
