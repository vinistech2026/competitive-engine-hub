"""
Google Sheets Direct Sync Daemon for Competitive Engine Hub
Reads audits from the local JSON registry and writes missing rows to Master Google Sheet.
"""
import json
import subprocess
from pathlib import Path

SHEET_ID = "1tUJvMemHp8bTx7yOp-irW_zw-yk9zWPWffp92u7GRQg"
REGISTRY_FILE = Path(r"C:\vinistech\11-Development\01-Projects\competitive-engine-hub\specs\registry.json")

def append_to_sheet(category, name, url, catch, stack, parity, market, dossier):
    row_data = f'"{category}","{name}","{url}","{catch}","{stack}","{parity}%","{market}","{dossier}"'
    cmd = ["gsheets", "mutate", "append", SHEET_ID, "Sheet1", row_data]
    print(f"Syncing: {name}...")
    res = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if res.returncode == 0:
        print(f" Successfully appended {name} to Google Sheet.")
    else:
        print(f"❌ Failed: {res.stderr}")

if __name__ == "__main__":
    if REGISTRY_FILE.exists():
        audits = json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
        for a in audits:
            append_to_sheet(
                a.get("category"), a.get("name"), a.get("url"),
                a.get("commercialCatch"), a.get("openStack"),
                a.get("parity"), a.get("marketIndex"), a.get("dossier")
            )
