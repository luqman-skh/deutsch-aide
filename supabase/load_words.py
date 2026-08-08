import json
import os

from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


with open(
    "data\\rep12_api\\german_vocab_a1.json",
    "r",
    encoding="utf-8"
) as f:
    words = json.load(f)


# Upload in batches
BATCH_SIZE = 500

for i in range(0, len(words), BATCH_SIZE):

    batch = words[i:i + BATCH_SIZE]

    response = (
        supabase
        .table("german_words")
        .insert(batch)
        .execute()
    )

    print(
        f"Uploaded {min(i + BATCH_SIZE, len(words))}"
        f"/{len(words)}"
    )

print("Done!")