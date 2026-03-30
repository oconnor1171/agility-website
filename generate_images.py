import os, base64, json, urllib.request, ssl, time

API_KEY = "AIzaSyC6mTNzfxveQu5aPybKWO9JLzccbUZEeKs"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={API_KEY}"
OUTPUT_DIR = r"C:\RJO\Agility\website\images"

IMAGES = [
    ("hero-office.jpg", "Professional modern accounting office interior with diverse team collaborating, navy blue and gold accents, corporate, no text, photorealistic"),
    ("hero-restaurant.jpg", "Upscale restaurant interior warm ambient lighting wooden tables bar area, no text, photorealistic"),
    ("hero-real-estate.jpg", "Real estate cityscape modern buildings urban skyline investment concept, no text, photorealistic"),
    ("hero-business-funding.jpg", "Business capital growth concept professional meeting about funding charts, no text, photorealistic"),
    ("hero-handbook.jpg", "Restaurant management handbook concept chef hat business documents culinary theme, no text, photorealistic"),
    ("service-tax-planning.jpg", "Tax planning consultation advisor reviewing documents at desk with client calculator, no text, photorealistic"),
    ("service-estate-planning.jpg", "Estate planning concept family wealth documents legal papers advisor, no text, photorealistic"),
    ("service-business-formation.jpg", "Business formation handshake over LLC paperwork corporate meeting, no text, photorealistic"),
    ("service-tax-prep.jpg", "Tax preparation workspace calculator tax forms laptop spreadsheet, no text, photorealistic"),
    ("service-bookkeeping.jpg", "Bookkeeping accounting ledger book laptop financial data organized desk, no text, photorealistic"),
    ("service-financial-consult.jpg", "Financial consultation meeting advisor client charts graphs modern office, no text, photorealistic"),
    ("team-meeting.jpg", "Professional team meeting conference room diverse business people strategy, no text, photorealistic"),
    ("office-photo.jpg", "Modern accounting firm office lobby professional Baltimore building welcoming, no text, photorealistic"),
    ("blog-tax-strategies.jpg", "Tax strategy planning documents financial charts pen calculator desk, no text, photorealistic"),
    ("blog-restaurant-owner.jpg", "Successful restaurant owner standing proudly in restaurant warm lighting, no text, photorealistic"),
    ("resource-calculator.jpg", "Financial calculator tool desk spreadsheets accounting tools, no text, photorealistic"),
    ("resource-tax-calendar.jpg", "Tax calendar deadline schedule marked important dates organized, no text, photorealistic"),
    ("industry-construction.jpg", "Construction site tools equipment hard hats blueprints table, no text, photorealistic"),
    ("handbook-cover.jpg", "Professional book cover restaurant management handbook navy blue gold, no text, photorealistic"),
    ("bob-portrait.jpg", "Professional headshot portrait confident male CPA 40s navy suit gold tie studio background, no text, photorealistic"),
]

def generate_image(filename, prompt):
    payload = json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["IMAGE","TEXT"]}}).encode()
    req = urllib.request.Request(API_URL, data=payload, headers={"Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=60) as resp:
            data = json.loads(resp.read())
        for part in data["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                img = base64.b64decode(part["inlineData"]["data"])
                with open(os.path.join(OUTPUT_DIR, filename), "wb") as f: f.write(img)
                print(f"  OK: {filename} ({len(img)//1024} KB)")
                return True
        print(f"  WARN: No image for {filename}")
        return False
    except Exception as e:
        print(f"  ERROR: {filename} - {e}")
        return False

os.makedirs(OUTPUT_DIR, exist_ok=True)
print(f"Generating {len(IMAGES)} images...")
ok = 0
for i,(fn,pr) in enumerate(IMAGES,1):
    fp = os.path.join(OUTPUT_DIR, fn)
    if os.path.exists(fp) and os.path.getsize(fp)>1000:
        print(f"[{i}/{len(IMAGES)}] SKIP: {fn}")
        ok+=1; continue
    print(f"[{i}/{len(IMAGES)}] Generating {fn}...")
    if generate_image(fn,pr): ok+=1
    time.sleep(1)
print(f"\nDone! {ok}/{len(IMAGES)} images saved to {OUTPUT_DIR}")
