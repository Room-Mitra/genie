#!/usr/bin/env bash

#
# Run this first to add an index - 
# aws dynamodb update-table \
#   --endpoint-url http://localhost:8000 \
#   --table-name ENTITY \
#   --attribute-definitions AttributeName=active_pk,AttributeType=S AttributeName=active_sk,AttributeType=S \
#   --global-secondary-index-updates '[{"Create":{"IndexName":"GSI_Active","KeySchema":[{"AttributeName":"active_pk","KeyType":"HASH"},{"AttributeName":"active_sk","KeyType":"RANGE"}],"Projection":{"ProjectionType": "ALL"}, "ProvisionedThroughput":{"ReadCapacityUnits":1,"WriteCapacityUnits":1}}}]'


set -euo pipefail

# --- CONFIG ---
TABLE_NAME="ENTITY"
ENDPOINT_URL="http://localhost:8000"
BATCH_LIMIT=500

echo "Starting backfill of active_pk and active_sk for table: $TABLE_NAME"
echo "Using endpoint: $ENDPOINT_URL"
echo "--------------------------------------------"

LAST_EVALUATED_KEY="null"
COUNT=0

while true; do
  # Scan a page of items where deletedAt does not exist
  SCAN_OUTPUT=$(aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --endpoint-url "$ENDPOINT_URL" \
    --filter-expression "attribute_not_exists(deletedAt)" \
    --projection-expression "pk, sk" \
    --limit "$BATCH_LIMIT" \
    --return-consumed-capacity TOTAL \
    --output json \
    $( [[ "$LAST_EVALUATED_KEY" != "null" ]] && echo --exclusive-start-key "$LAST_EVALUATED_KEY" ) )

  # Extract items
  ITEMS=$(echo "$SCAN_OUTPUT" | jq -c '.Items[]?')
  LAST_EVALUATED_KEY=$(echo "$SCAN_OUTPUT" | jq -c '.LastEvaluatedKey // null')

  # Stop if no items found
  if [[ -z "$ITEMS" ]]; then
    echo "No more items to backfill."
    break
  fi

  # Iterate each item
  for ITEM in $ITEMS; do
    PK=$(echo "$ITEM" | jq -r '.pk.S')
    SK=$(echo "$ITEM" | jq -r '.sk.S')

    echo "Updating: pk=$PK sk=$SK"

    aws dynamodb update-item \
      --table-name "$TABLE_NAME" \
      --endpoint-url "$ENDPOINT_URL" \
      --key "{\"pk\": {\"S\": \"$PK\"}, \"sk\": {\"S\": \"$SK\"}}" \
      --update-expression "SET active_pk = :pk, active_sk = :sk" \
      --condition-expression "attribute_not_exists(active_pk) AND attribute_not_exists(deletedAt)" \
      --expression-attribute-values "{\":pk\": {\"S\": \"$PK\"}, \":sk\": {\"S\": \"$SK\"}}" \
      >/dev/null

    ((COUNT++))
  done

  echo "Processed $COUNT items so far..."
  [[ "$LAST_EVALUATED_KEY" == "null" ]] && break
done

echo "--------------------------------------------"
echo "✅ Backfill complete. Total items updated: $COUNT"
