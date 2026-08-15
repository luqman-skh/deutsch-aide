import json
import os

from dotenv import load_dotenv
from supabase import create_client


# ============================================================
# Configuration
# ============================================================

JSON_FILE = "data\\rep12_api\\grammar.json"

TABLE_NAME = "grammar_rules"

BATCH_SIZE = 500


# ============================================================
# Load environment variables
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv(
    "SUPABASE_SECRET_KEY"
)

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from .env")

if not SUPABASE_SECRET_KEY:
    raise ValueError(
        "SUPABASE_SECRET_KEY is missing from .env"
    )


# ============================================================
# Connect to Supabase
# ============================================================

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
)


# ============================================================
# Load JSON
# ============================================================

print(f"Loading {JSON_FILE}...")

with open(
    JSON_FILE,
    "r",
    encoding="utf-8"
) as f:
    data = json.load(f)


# ============================================================
# Extract grammar rules
# ============================================================

rules = data["data"]

print(f"Found {len(rules)} grammar rules")


# ============================================================
# Prepare records
# ============================================================

records = []

for rule in rules:

    record = {
        "id": rule.get("id"),

        "category_code": rule.get(
            "category_code"
        ),

        "category_name": rule.get(
            "category_name"
        ),

        "subcategory": rule.get(
            "subcategory"
        ),

        "rule_german": rule.get(
            "rule_german"
        ),

        "rule_english": rule.get(
            "rule_english"
        ),

        "example_de": rule.get(
            "example_de"
        ),

        "example_en": rule.get(
            "example_en"
        ),

        "notes": rule.get(
            "notes"
        ),

        "related_ids": rule.get(
            "related_ids",
            []
        ),

        "cefr_levels": rule.get(
            "cefr_levels",
            []
        ),

        "tags": rule.get(
            "tags",
            []
        ),

        "source": rule.get(
            "source"
        ),

        "license_tag": rule.get(
            "license_tag"
        )
    }

    records.append(record)


# ============================================================
# Remove duplicate IDs
# ============================================================

unique_records = {}

for record in records:

    record_id = record["id"]

    if not record_id:
        print(
            "WARNING: Rule without ID:",
            record
        )
        continue

    unique_records[record_id] = record


records = list(unique_records.values())

print(
    f"Unique rules: {len(records)}"
)


# ============================================================
# Upload in batches
# ============================================================

print()
print("Uploading to Supabase...")


for start in range(
    0,
    len(records),
    BATCH_SIZE
):

    batch = records[
        start:start + BATCH_SIZE
    ]

    end = min(
        start + BATCH_SIZE,
        len(records)
    )

    print(
        f"Uploading {start + 1}-{end} "
        f"of {len(records)}..."
    )

    (
        supabase
        .table(TABLE_NAME)
        .upsert(
            batch,
            on_conflict="id"
        )
        .execute()
    )


print()
print("=" * 50)
print("Upload complete!")
print(f"Uploaded rules: {len(records)}")
print("=" * 50)