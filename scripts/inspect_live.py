import urllib.request, re, json

def inspect_page(path):
    url = f'https://palettelab.co{path}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        res = urllib.request.urlopen(req)
        html = res.read().decode('utf-8', errors='replace')
        print(f"=== {path} (Status {res.status}) ===")
        
        # Title
        title = re.findall(r'<title>(.*?)</title>', html)
        print("Title:", title[0] if title else "None")
        
        # Meta description
        desc = re.findall(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.I)
        print("Description:", desc[0] if desc else "None")
        
        # Canonical
        canon = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', html, re.I)
        print("Canonical:", canon[0] if canon else "None")
        
        # og:image & twitter:image
        og_img = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\'](.*?)["\']', html, re.I)
        tw_img = re.findall(r'<meta\s+name=["\']twitter:image["\']\s+content=["\'](.*?)["\']', html, re.I)
        print("og:image:", og_img[0] if og_img else "None")
        print("twitter:image:", tw_img[0] if tw_img else "None")
        
        # JSON-LD
        json_ld = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', html, re.S)
        print(f"JSON-LD count: {len(json_ld)}")
        for idx, j in enumerate(json_ld):
            try:
                data = json.loads(j.strip())
                if isinstance(data, dict):
                    t = data.get('@type', 'Graph' if '@graph' in data else 'unknown')
                elif isinstance(data, list):
                    t = f"List of {[item.get('@type') for item in data]}"
                else:
                    t = type(data)
                print(f"  JSON-LD [{idx}]: @type={t}")
            except Exception as ex:
                print(f"  JSON-LD [{idx}] parse error: {ex}")
                
        # AdSense script
        adsense = re.findall(r'<script[^>]*pagead2\.googlesyndication\.com[^>]*>', html)
        print("AdSense script in HTML:", adsense[0] if adsense else "None")
        
        # Check if pre-rendered / SSR or static SPA shell
        root_match = re.search(r'<div id=["\']root["\']>(.*?)</div>', html, re.S)
        if root_match:
            inner = root_match.group(1).strip()
            print("Root container inner length:", len(inner))
        else:
            print("Root container not found")
        
    except Exception as e:
        print(f"=== {path} ERROR: {e} ===")

inspect_page('/')
inspect_page('/pale-dusk-7416')
inspect_page('/color/264653')
inspect_page('/api/og/pale-dusk-7416.png')
inspect_page('/api/health')
