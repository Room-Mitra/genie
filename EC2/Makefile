.PHONY: dev stop create-dynamo-tables


create-dynamo-tables:
	./scripts/create-dynamo-tables.sh

# dev:
# 	mkdir -p ./dynamodb-local-data && \
# 	docker run -p 8000:8000 \
# 	-v ./dynamodb-local-data:/home/dynamodblocal/data amazon/dynamodb-local \
# 	-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data && \
# 	AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local dynamodb-admin

dev:
	@echo "Starting DynamoDB Local in Docker..."
	@docker run -d --rm \
		--name dynamodb-local \
		-p 8000:8000 \
		-v $$PWD/dynamodb-local-data:/home/dynamodblocal/data \
		amazon/dynamodb-local \
		-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data

	@echo "Waiting for DynamoDB to be ready..."
	@sleep 2

	@echo "Creating tables if they don't exist..."
	./scripts/create-dynamo-tables.sh &

	@echo "Starting dynamodb-admin..."
	@AWS_REGION=ap-south-1 \
		AWS_ACCESS_KEY_ID=local \
		AWS_SECRET_ACCESS_KEY=local \
		dynamodb-admin &

	@echo "Starting backend (Express)..."
	@npm run dev &

	@echo "Starting frontend (React)..."
	@cd frontend && npm start &

	@echo "All services started. Press Ctrl+C to stop."
	@trap 'make stop' INT; wait

stop:
	@echo "Stopping all services..."
	@docker stop $(DOCKER_CONTAINER_NAME)
	@pkill -f "npx dynamodb-admin" || true
	@pkill -f "node scripts/create-tables.js" || true
	@pkill -f "npm run dev" || true
	@pkill -f "npm start" || true
