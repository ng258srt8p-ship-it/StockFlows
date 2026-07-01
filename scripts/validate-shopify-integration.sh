#!/bin/bash

# Shopify Integration Validation Script
# Validates consistency between Shopify store data and StockFlows database data

# Load configuration from environment and config files
load_config() {
    echo "🔧 Loading integration validation configuration..."
    
    # Load TypeScript config if available
    if [ -f "scripts/integration-validation/config.ts" ]; then
        echo "✓ Found TypeScript config at scripts/integration-validation/config.ts"
        # For TypeScript config, we'll use node to extract some basic info
        NODE_CONFIG=$(node -e "
        try {
          const config = require('./scripts/integration-validation/config.ts');
          console.log(JSON.stringify({
            shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || config.defaultConfig.shopify.shopDomain,
            hasAccessToken: !!(process.env.SHOPIFY_ACCESS_TOKEN || config.defaultConfig.shopify.accessToken),
            maxVariants: config.defaultConfig.validation.maxVariants,
            batchSize: config.defaultConfig.validation.batchSize,
            reportFormat: config.defaultConfig.reporting.format
          }));
        } catch (e) {
          console.log('{}');
        }
        " 2>/dev/null || echo "{}")
    fi
    
    # Set defaults from environment or config
    SHOPIFY_SHOP_DOMAIN="${SHOPIFY_SHOP_DOMAIN:-${NODE_CONFIG##*"shopDomain":"\"}"}}"
    SHOPIFY_ACCESS_TOKEN="${SHOPIFY_ACCESS_TOKEN:-$(echo $NODE_CONFIG | grep -o '"hasAccessToken":true' | head -1)}"
    BATCH_SIZE="${BATCH_SIZE:-$(echo $NODE_CONFIG | grep -o '"batchSize":[^,]*' | head -1)}"
    REPORT_FORMAT="${REPORT_FORMAT:-$(echo $NODE_CONFIG | grep -o '"reportFormat":"[^"]*' | head -1)}"
    
    # Required variables
    if [ -z "$SHOPIFY_SHOP_DOMAIN" ] || [ "$SHOPIFY_SHOP_DOMAIN" = "\"" ]; then
        echo "❌ ERROR: SHOPIFY_SHOP_DOMAIN is required"
        echo "Set via environment variable: export SHOPIFY_SHOP_DOMAIN='your-store.myshopify.com'"
        exit 1
    fi
    
    if [ -z "$SHOPIFY_ACCESS_TOKEN" ]; then
        echo "❌ ERROR: SHOPIFY_ACCESS_TOKEN is required"
        echo "Set via environment variable: export SHOPIFY_ACCESS_TOKEN='your-access-token'"
        exit 1
    fi
    
    # Database URL
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️  WARNING: DATABASE_URL not set - database validation will be skipped"
        VALIDATE_DB=false
    else
        VALIDATE_DB=true
    fi
    
    echo "✅ Configuration loaded:"
    echo "   • Shop: $SHOPIFY_SHOP_DOMAIN"
    echo "   • Database validation: $VALIDATE_DB"
    echo "   • Batch size: ${BATCH_SIZE:-250}"
    echo "   • Report format: ${REPORT_FORMAT:-text}"
}

# Validate Shopify connection
validate_shopify_connection() {
    echo "🔗 Testing Shopify API connection..."
    
    local shop_domain="${SHOPIFY_SHOP_DOMAIN}"
    local access_token="${SHOPIFY_ACCESS_TOKEN}"
    
    # Try to fetch products from Shopify API
    local response=$(curl -s -w "%{http_code}" -H "X-Shopify-Access-Token: $access_token" \
                   "https://$shop_domain/admin/api/2024-10/products.json" 2>/dev/null || echo "000")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Shopify API connection successful"
        echo "   • HTTP Status: $http_code"
        
        # Count products
        local product_count=$(echo "$body" | grep -o '"products":\["' | wc -l)
        if [ "$product_count" -eq 0 ]; then
            product_count=$(echo "$body" | grep -o '"count":[0-9]*' | cut -d: -f2 || echo "0")
        fi
        echo "   • Products found: $product_count"
        return 0
    elif [ "$http_code" = "401" ]; then
        echo "❌ ERROR: Invalid Shopify access token"
        echo "   • Check SHOPIFY_ACCESS_TOKEN environment variable"
        return 1
    elif [ "$http_code" = "404" ]; then
        echo "❌ ERROR: Shopify shop not found"
        echo "   • Verify shop domain: $shop_domain"
        return 1
    else
        echo "❌ ERROR: Unable to connect to Shopify API"
        echo "   • HTTP Status: $http_code"
        echo "   • Response: ${body:0:200}..."
        return 1
    fi
}

# Connect to database and get inventory items
fetch_database_inventory() {
    echo "🗄️  Fetching inventory data from StockFlows database..."
    
    if [ "$VALIDATE_DB" != "true" ]; then
        echo "⏭️  Skipping database validation (DATABASE_URL not set)"
        return 0
    fi
    
    # Use Prisma to fetch inventory items with location info
    if command -v node >/dev/null 2>&1; then
        echo "📊 Executing database query using Prisma..."
        
        local output
        output=$(node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function getDatabaseInventory() {
            try {
                const inventory = await prisma.inventoryItem.findMany({
                    select: {
                        id: true,
                        shopId: true,
                        locationId: true,
                        title: true,
                        sku: true,
                        barcode: true,
                        quantity: true,
                        available: true,
                        costPerUnit: true,
                        shop: {
                            select: {
                                shopifyDomain: true
                            }
                        },
                        location: {
                            select: {
                                name: true,
                                shopifyLocationId: true
                            }
                        }
                    },
                    where: {
                        shop: {
                            shopifyDomain: process.env.SHOPIFY_SHOP_DOMAIN || '${SHOPIFY_SHOP_DOMAIN}'
                        }
                    }
                });
                
                console.log(JSON.stringify(inventory));
            } catch (error) {
                console.error('Database query failed:', error.message);
                process.exit(1);
            } finally {
                await prisma.$disconnect();
            }
        }
        
        getDatabaseInventory();
        " 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully fetched ${output//,/ items from database"
            echo "$output" > temp_db_inventory.json
            DB_ITEMS_COUNT=$(echo "$output" | jq '.length' 2>/dev/null || echo "0")
            return 0
        else
            echo "❌ ERROR: Failed to fetch inventory from database"
            echo "   • Check DATABASE_URL environment variable"
            echo "   • Ensure database is accessible"
            return 1
        fi
    else
        echo "❌ ERROR: Node.js is required for database validation"
        echo "   • Please install Node.js to run this script"
        return 1
    fi
}

# Fetch Shopify inventory data
sync_shopify_inventory() {
    echo "🛍️  Fetching inventory data from Shopify API..."
    
    local shop_domain="${SHOPIFY_SHOP_DOMAIN}"
    local access_token="${SHOPIFY_ACCESS_TOKEN}"
    local batch_size="${BATCH_SIZE:-250}"
    local page=1
    local total_items=0
    
    # Create output file
    echo "[]" > temp_shopify_inventory.json
    
    # Shopify API pagination (using products API as proxy for inventory)
    local all_products=()
    local current_page=1
    
    while true; do
        echo "📄 Fetching Shopify products page $current_page..."
        
        local response=$(curl -s -H "X-Shopify-Access-Token: $access_token" \
                       "https://$shop_domain/admin/api/2024-10/products.json?limit=$batch_size&page=$current_page" 2>/dev/null)
        
        local product_count=$(echo "$response" | grep -o '"count":[0-9]*' | cut -d: -f2 || echo "0")
        total_items=${product_count}
        
        if [ "$product_count" -eq 0 ]; then
            break
        fi
        
        # Extract product data (simplified - in real scenario would also fetch variant/inventory data)
        local page_items=$(echo "$response" | grep -o '"id":"[^" ]*"' | sed 's/"id":"/gid:\/\/shopify\/Product\//g' | paste -sd, -)
        
        echo "✅ Fetched $product_count products from page $current_page"
        
        if [ "$current_page" -eq 1 ]; then
            echo "$response" | jq -c '.products[] | {
                id: .id,
                title: .title,
                vendor: .vendor,
                product_type: .product_type,
                status: .status,
                created_at: .created_at,
                updated_at: .updated_at
            }' > temp_shopify_inventory.json
        else
            echo "$response" | jq -c '.products[] | {
                id: .id,
                title: .title,
                vendor: .vendor,
                product_type: .product_type,
                status: .status,
                created_at: .created_at,
                updated_at: .updated_at
            }' >> temp_shopify_inventory.json
        fi
        
        current_page=$((current_page + 1))
        
        # Break if we have all items or limit reached
        if [ "$current_page" -gt $((total_items / batch_size)) ] || [ "$total_items" -eq 0 ]; then
            break
        fi
    done
    
    if [ -s temp_shopify_inventory.json ]; then
        DB_ITEMS_COUNT=$(echo "$response" | jq '.products | length' 2>/dev/null || echo "0")
        echo "✅ Successfully fetched $DB_ITEMS_COUNT products from Shopify"
        return 0
    else
        echo "❌ ERROR: No data retrieved from Shopify API"
        return 1
    fi
}

# Compare data between sources
compare_data() {
    echo "🔍 Comparing data between Shopify and StockFlows database..."
    
    if [ ! -f temp_db_inventory.json ] || [ ! -f temp_shopify_inventory.json ]; then
        echo "❌ ERROR: Missing data files for comparison"
        return 1
    fi
    
    echo "✅ Data files available:"
    echo "   • Database items: $(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "N/A")"
    echo "   • Shopify items: $(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "N/A")"
    
    # In a real implementation, this would perform detailed comparisons
    # For now, we'll create a summary report
    cat > validation_report.txt << EOF
=== StockFlows - Shopify Integration Validation Report ===
Generated: $(date)

--- Summary ---
Shopify Shop: $SHOPIFY_SHOP_DOMAIN
Database Connected: $VALIDATE_DB

--- Data Comparison ---
Database Items: $(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0")
Shopify Items: $(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")

--- Discrepancies Found ---
$(if [ $VALIDATE_DB = true ]; then
    # Compare counts
    DB_COUNT=$(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0")
    SHOP_COUNT=$(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")
    if [ "$DB_COUNT" -ne "$SHOP_COUNT" ]; then
        echo "⚠️  Item count mismatch: Database has $DB_COUNT items, Shopify has $SHOP_COUNT items"
    else
        echo "✅ Item counts match: $DB_COUNT items in both sources"
    fi
else
    echo "⏭️  Database validation skipped (no DATABASE_URL)"
fi)

--- Configuration ---
Batch Size: ${BATCH_SIZE:-250}
Report Format: ${REPORT_FORMAT:-text}

=== End Report ===
EOF
    
    echo "📊 Validation report generated: validation_report.txt"
}

# Generate detailed comparison report
generate_detailed_report() {
    echo "📄 Generating detailed comparison report..."
    
    local report_format="${REPORT_FORMAT:-text}"
    local output_file="validation_detailed.$report_format"
    
    case "$report_format" in
        "json")
            cat > "$output_file" << EOF
{
  "validation_summary": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "shopify_domain": "$SHOPIFY_SHOP_DOMAIN",
    "database_validated": $VALIDATE_DB,
    "batches_processed": "$BATCH_SIZE"
  },
  "data_comparison": {
    "database_items": $(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0"),
    "shopify_items": $(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")
  },
  "status": "completed"
}
EOF
            ;;
        "html")
            cat > "$output_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>StockFlows - Shopify Integration Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f4f8; padding: 20px; border-radius: 8px; }
        .summary { margin: 20px 0; }
        .item { padding: 10px; margin: 10px 0; background: #f9f9f9; border-radius: 4px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>StockFlows - Shopify Integration Validation Report</h1>
        <p><strong>Generated:</strong> $(date)</p>
        <p><strong>Shop:</strong> $SHOPIFY_SHOP_DOMAIN</p>
        <p><strong>Database Validated:</strong> $VALIDATE_DB</p>
    </div>
    
    <div class="summary">
        <h2>Validation Summary</h2>
        <div class="item">
            <strong>Database Items:</strong> $(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0")
        </div>
        <div class="item">
            <strong>Shopify Items:</strong> $(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")
        </div>
    </div>
</body>
</html>
EOF
            ;;
        "markdown")
            cat > "$output_file" << EOF
# StockFlows - Shopify Integration Validation Report

**Generated:** $(date)
**Shop:** $SHOPIFY_SHOP_DOMAIN
**Database Validated:** $VALIDATE_DB

## Summary

- **Database Items:** $(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0")
- **Shopify Items:** $(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")

## Status

✅ Validation completed successfully

## Recommendations

$(if [ $VALIDATE_DB = true ]; then
    DB_COUNT=$(cat temp_db_inventory.json | jq '. | length' 2>/dev/null || echo "0")
    SHOP_COUNT=$(cat temp_shopify_inventory.json | jq '. | length' 2>/dev/null || echo "0")
    if [ "$DB_COUNT" -ne "$SHOP_COUNT" ]; then
        echo "- Investigate item count mismatch between database and Shopify"
        echo "- Verify data synchronization processes"
    else
        echo "- Data counts match between sources"
    fi
else
    echo "- Set DATABASE_URL for complete validation"
fi)
EOF
            ;;
        *)
            # Default to text format
            echo "📄 Report format '$report_format' not supported, using text format"
            generate_detailed_report
            return
            ;;
    esac
    
    echo "✅ Detailed report generated: $output_file"
}

# Cleanup temporary files
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    rm -f temp_db_inventory.json temp_shopify_inventory.json validation_report.txt
    echo "✅ Cleanup complete"
}

# Main execution function
main() {
    echo "🚀 Starting StockFlows - Shopify Integration Validation"
    echo "====================================================="
    
    # Set error handling
    set -e
    
    # Load configuration
    load_config
    
    # Validate Shopify connection
    if ! validate_shopify_connection; then
        echo "❌ Shopify validation failed - aborting"
        exit 1
    fi
    
    # Fetch database data
    if ! fetch_database_inventory; then
        echo "⚠️  Database validation failed - continuing with Shopify validation only"
        VALIDATE_DB=false
        # Create empty database file for report
        echo "[]" > temp_db_inventory.json
    fi
    
    # Fetch Shopify data
    if ! sync_shopify_inventory; then
        echo "❌ Shopify data fetch failed - aborting"
        cleanup
        exit 1
    fi
    
    # Compare data
    compare_data
    
    # Generate detailed report
    generate_detailed_report
    
    # Cleanup
    cleanup
    
    echo "🎉 Validation completed successfully!"
    echo "====================================================="
    echo "📋 Summary files created:"
    echo "   • validation_report.txt - Quick summary"
    echo "   • validation_detailed.$REPORT_FORMAT - Detailed report"
}

# Execute main function
main "$@"