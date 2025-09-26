#!/usr/bin/env python3
import os
import csv
import json
import time
import argparse
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from urllib.parse import unquote

import requests

# ---------- FILL THESE (or set via env) ----------
ANTI_CSRF_TOKEN = os.getenv("AMZ_ANTI_CSRF", "hNHU8qvgUlJScPUPplLDOz1o2RiOAB7EXfupumdo/XlcAAAAAGjCWsYAAAAB")
COOKIE_STRING = os.getenv("AMZ_COOKIE", """session-id=260-8900696-3948530; ubid-acbin=259-1153786-7275411; s_ev22=%5B%5B%27missing%2520item%27%2C%271738212136481%27%5D%5D; i18n-prefs=INR; lc-acbin=en_IN; s_ppv=72; at-acbin=Atza|IwEBIMyBRumfU2g4HbAkJ0IZzfSOs7EEYVQ4CWgXuWt1D5Qp2_zUIHEHc5EOwnaDMcOdnX58Wk7w6NvxWjuOcgDa5AM3wZat24ErYK6FIc7vfy3TpQDwrT2IBVa9r5TeeuhwLN8Mlq8jeQyRWZJKEEG2HMNK3u3nfvUVjQd_Lnmx0MsGVnD23QoVJLMj1__56dMchu_KGEyJxR9DFozZwYbp2hwo4jUW4vNnGkDXipMVhI_RNzCVYopI1ZQL8o22MZsI54I; sess-at-acbin="zaP+AONDNRHNcnYAmWGzzagNBmO0calpb6JfIbn3NG8="; sst-acbin=Sst1|PQEpKY7lMwqENzLvKMU8eyB4CQCTQDSF5vFbyXGlMfKDML54IKNL8fQ1B98Jw5VTOhgmG_L8OcIahnw1mQ88ZwFIhWkJ0P4fOi16PvlaGVkNHYs5YWrjGjN6Vi5Sqgs4uw5kGxorUgxN-jXedIlnQpWyoSndbOUs1TuezgW1VJZInRWSKf2ACaKA1z95kFeW_imFMEhmD3fTYfQ7aFvaCCiCYVMYmG0fD22Ii_iMzUL-g-IsIHWxp7F2KwsBT7oZ3dWWPZHKqME_MCC8ZtGw6yRbZD-zx-ISzkfomqsmr57-pHM; session-id-time=2082787201l; s_cc=true; s_nr=1757566990391-Repeat; s_vnum=2170212092141%26vn%3D2; s_invisit=true; s_dslv=1757566990391; s_dslv_s=More%20than%2030%20days; s_c27=no%20value; s_sq=%5B%5BB%5D%5D; session-token=O+b7iXbM2KwhkurBE9juqWN1YPLf+UThK2kEZDwv+CRQ+Chekih69KMj2z4/Notw0TnBKdT1S9wiH+s8pkt+T3Wgj+S8qWxR1rog5XvIVRSLfXv2d/sqxvief+JyxTagxYeBayeK4FiZf07i6MR5V30xPetJPSck9lJDOF7vMftngq8P+qDb09TQn8egs84LR3dC6ie8R3DJqfAMcbjD+E5i1FGNVpvwYVguU4WBf8Jn/mgGSnDDYk1Yeqs4mfyb2OpEJDLUNm87h2ljXhpJ5FPP/lQ0xnGm/I1AvDphSSdR461NYM6wuLO8oxztlK6qLLqwM4mRAuqMsmGnVNudV74r5kiYLei+Q4kG7jz9KGUrMVPO6rjqDEaaDUs5WoXb; x-acbin="H@Q?KpdZ7fSuJ5UMNcJkShcXjD0xwT2aVgmDCA71F@WK@SjN@?I9YPZ7YxgUppQR"; csm-hit=tb:3AJM0P6PJ8CXEG7BBJ5Y+s-4G6JM9B4NTTGGDTFDXBV|1757567689774&t:1757567689774&adb:adblk_yes; rxc=ALMBJ2VI5ZfYTXYgGUM""")
# -------------------------------------------------

BASE_URL = "https://www.amazon.in/alexa-privacy/apd/rvh/customer-history-records-v2"
REQUEST_DELAY_SEC = 0.3

def now_ms() -> str:
    return str(int(datetime.now(timezone.utc).timestamp() * 1000))

def to_ms(dt: datetime) -> str:
    return str(int(dt.replace(tzinfo=timezone.utc).timestamp() * 1000))

def parse_cookie_string(cookie_str: str) -> dict:
    cookies = {}
    for part in cookie_str.split(";"):
        part = part.strip()
        if not part:
            continue
        if "=" in part:
            k, v = part.split("=", 1)
            cookies[k.strip()] = unquote(v.strip())
        else:
            cookies[part] = ""
    return cookies

def ist_from_ms(ms: int) -> str:
    # Convert epoch ms to Asia/Kolkata date time
    dt_utc = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
    dt_ist = dt_utc.astimezone(ZoneInfo("Asia/Kolkata"))
    return dt_ist.strftime("%Y-%m-%d %H:%M:%S %Z")

def build_args():
    p = argparse.ArgumentParser(description="Fetch Alexa voice history and export to CSV with streaming.")
    # time window
    g = p.add_mutually_exclusive_group()
    g.add_argument("--start-days-ago", type=int, help="Start N days ago (UTC).")
    g.add_argument("--start-time-ms", type=str, help="Explicit startTime in milliseconds.")
    p.add_argument("--end-time-ms", type=str, help="Explicit endTime in milliseconds; default is now.")
    # outputs
    p.add_argument("--out-ndjson", type=str, default="alexa_history.ndjson", help="NDJSON output path.")
    p.add_argument("--out-csv", type=str, default="alexa_voice_history.csv", help="Final CSV output path.")
    # controls
    p.add_argument("--max-pages", type=int, default=0, help="Stop after N pages (0 = no limit).")
    return p.parse_args()

def fetch_to_ndjson(start_time: str, end_time: str, ndjson_path: str, max_pages: int = 0) -> int:
    """Stream all records to an NDJSON file; returns count of records written."""
    session = requests.Session()
    session.headers.update({
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        "anti-csrftoken-a2z": ANTI_CSRF_TOKEN,
        "origin": "https://www.amazon.in",
        "referer": "https://www.amazon.in/alexa-privacy/apd/rvh",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    })
    session.cookies.update(parse_cookie_string(COOKIE_STRING))

    query_params = {
        "startTime": start_time,
        "endTime": end_time,
        "disableGlobalNav": "false",
    }

    total = 0
    page = 1
    prev_token = None

    with open(ndjson_path, "w", encoding="utf-8") as f:
        while True:
            payload = {"previousRequestToken": prev_token}
            resp = session.post(BASE_URL, params=query_params, json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            records = data.get("customerHistoryRecords", []) or []
            if not records:
                break

            # Write each record as a single NDJSON line with IST timestamp added
            for rec in records:
                rec_out = dict(rec)  # shallow copy
                rec_out["timestamp_ist"] = ist_from_ms(int(rec.get("timestamp", 0)))
                f.write(json.dumps(rec_out, ensure_ascii=False) + "\n")
                total += 1

            prev_token = data.get("encodedRequestToken")
            if not prev_token:
                break

            if max_pages and page >= max_pages:
                break

            page += 1
            time.sleep(REQUEST_DELAY_SEC)

    return total

def discover_item_types(ndjson_path: str) -> set:
    """First pass over NDJSON to learn all unique recordItemType values."""
    types = set()
    with open(ndjson_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = json.loads(line)
            items = rec.get("voiceHistoryRecordItems") or []
            for it in items:
                rtype = it.get("recordItemType") or "UNKNOWN_ITEM_TYPE"
                types.add(rtype)
    return types

def row_from_record(rec: dict, dynamic_types: list[str]) -> dict:
    """Flatten a single record into a CSV row using fixed + dynamic columns."""
    row = {
        "timestamp_ist": rec.get("timestamp_ist", ""),
        "device.deviceName": ((rec.get("device") or {}).get("deviceName", "")),
        "domain": rec.get("domain", ""),
        "intent": rec.get("intent", ""),
    }

    # Collect transcriptText per type (join multiple with " | ")
    buckets = {t: [] for t in dynamic_types}
    for it in (rec.get("voiceHistoryRecordItems") or []):
        rtype = it.get("recordItemType") or "UNKNOWN_ITEM_TYPE"
        if rtype not in buckets:
            # unseen type (shouldn't happen if discover pass was complete), still handle gracefully
            buckets[rtype] = []
        text = it.get("transcriptText") or ""
        buckets[rtype].append(text.strip())

    # Fill dynamic columns
    for t in dynamic_types:
        row[t] = " | ".join([v for v in buckets.get(t, []) if v])

    return row

def ndjson_to_csv(ndjson_path: str, csv_path: str):
    # Discover all dynamic types
    dynamic_types = sorted(discover_item_types(ndjson_path))
    fixed_cols = ["timestamp_ist", "device.deviceName", "domain", "intent"]
    fieldnames = fixed_cols + dynamic_types

    # Second pass: write CSV streaming
    with open(ndjson_path, "r", encoding="utf-8") as fin, \
         open(csv_path, "w", newline="", encoding="utf-8") as fout:
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()
        for line in fin:
            if not line.strip():
                continue
            rec = json.loads(line)
            row = row_from_record(rec, dynamic_types)
            writer.writerow(row)

def main():
    args = build_args()

    # Resolve time window
    if args.start_time_ms:
        start_time = args.start_time_ms
    elif args.start_days_ago is not None:
        start_dt = datetime.now(timezone.utc) - timedelta(days=args.start_days_ago)
        start_time = to_ms(start_dt)
    else:
        start_time = "0"

    # end_time = args.end_time_ms if args.end_time_ms else now_ms()
    end_time = 1754462279499

    # Pass 1: fetch and stream to NDJSON
    # print(f"Fetching records to {args.out_ndjson} ...")
    # count = fetch_to_ndjson(start_time, end_time, args.out_ndjson, max_pages=args.max_pages)
    # print(f"Wrote {count} NDJSON record(s).")

    # if count == 0:
        # print("No records found. Skipping CSV export.")
        # return

    # Pass 2: NDJSON -> CSV (schema discovery + write)
    print(f"Converting NDJSON to CSV at {args.out_csv} ...")
    ndjson_to_csv(args.out_ndjson, args.out_csv)
    print(f"Done. CSV written to {args.out_csv}")

if __name__ == "__main__":
    main()
