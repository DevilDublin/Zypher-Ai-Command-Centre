
import csv

def get_pipeline_counts(csv_path="campaign.csv"):
    counts = {
        "new": 0,
        "contacted": 0,
        "qualified": 0,
        "booked": 0
    }

    with open(csv_path, newline='', encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            stage = (row.get("Stage") or "").strip().lower()

            # Ignore test leads
            if stage == "test_lead":
                continue

            if stage == "cold":
                counts["new"] += 1
            elif stage == "contacted":
                counts["contacted"] += 1
            elif stage == "qualified":
                counts["qualified"] += 1
            elif stage == "booked":
                counts["booked"] += 1

    return counts


if __name__ == "__main__":
    import json
    counts = get_pipeline_counts()
    print(json.dumps(counts))
