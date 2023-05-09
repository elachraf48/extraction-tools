import requests
from bs4 import BeautifulSoup
import openpyxl

# Open input file and read domains
with open("domains.txt", "r") as f:
    domains = f.read().splitlines()

# Create workbook and worksheet
wb = openpyxl.Workbook()
ws = wb.active
ws.append(["Domain", "Reputation", "Email Volume History"])

# Loop through domains and get reputation information
for domain in domains:
    url = f"https://talosintelligence.com/reputation_center/lookup?search={domain}"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    # Get reputation
    reputation = soup.select_one(".value-label span").text.strip()

    # Get email volume history, if available
    email_volume = ""
    email_volume_elem = soup.select_one("#email-volume .value-label span")
    if email_volume_elem is not None:
        email_volume = email_volume_elem.text.strip()

    # Add data to worksheet
    ws.append([domain, reputation, email_volume])

# Save workbook to file
wb.save("reputation.xlsx")
