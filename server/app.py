import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Added headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Force use of chromium
    chrome_options.binary_location = "/usr/bin/chromium"
    
    # Correctly handle version for Chromium
    service = Service(ChromeDriverManager(driver_version="146.0.7680.177").install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

@app.route('/search', methods=['POST'])
def search_movies():
    data = request.json
    query = data.get('query')
    source_type = data.get('source', 'hollywood')  # 'bollywood' or 'hollywood'
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    driver = get_driver()
    results = []
    
    try:
        if source_type in ['hollywood', 'bollywood']:
            re_param = "vegamovies" if source_type == 'hollywood' else "rogmovies"
            url = f"https://vglist.cv/?re={re_param}"
            print(f"Navigating to {url} for {source_type} search")
            driver.get(url)
    
            # Wait for page to load and get the redirected URL
            time.sleep(3)
    
            # Get the current URL after redirect
            redirected_url = driver.current_url
            print(f"Redirected to: {redirected_url}")
    
            # Extract base URL and append search query
            from urllib.parse import quote_plus, urlparse
    
            parsed = urlparse(redirected_url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            formatted_query = quote_plus(query)
    
            search_url = f"{base_url}/search.html?q={formatted_query}"
            print(f"Navigating to search URL: {search_url}")
            driver.get(search_url)
    
            time.sleep(3)  # Wait for results to load
    
            # Re-scout for movie links
            movie_cards = driver.find_elements(By.XPATH, "//a[contains(@href, '/download-')]")
            print(f"Found {len(movie_cards)} potential movie links")
            
            for card in movie_cards:
                    try:
                        href = card.get_attribute("href")
                        # Avoid duplicates
                        if any(r['link'] == href for r in results):
                            continue
                            
                        # Title extraction
                        title = ""
                        try:
                            title_el = card.find_element(By.CLASS_NAME, "poster-title")
                            title = title_el.text.strip()
                        except:
                            title = card.text.strip()
                        
                        if not title:
                            title = href.split("/")[-2].replace("-", " ")
    
                        # Image extraction
                        image = ""
                        try:
                            img_el = card.find_element(By.TAG_NAME, "img")
                            image = img_el.get_attribute("src")
                        except:
                            pass
                            
                        # Quality extraction
                        quality = ""
                        try:
                            q_el = card.find_element(By.CLASS_NAME, "poster-quality")
                            quality = q_el.text.strip()
                        except:
                            pass
    
                        results.append({
                            "title": title,
                            "link": href,
                            "image": image,
                            "quality": quality
                        })
                    except Exception as e:
                        print(f"Error parsing card: {e}")
                        continue
                        
        elif source_type == 'moviesnation':
            from urllib.parse import quote_plus
            search_url = f"https://moviesnation.health/?s={quote_plus(query)}"
            print(f"Navigating to search URL: {search_url}")
            driver.get(search_url)
            
            time.sleep(3)
            
            movie_cards = driver.find_elements(By.CSS_SELECTOR, "article.post-item")
            print(f"Found {len(movie_cards)} potential movie links")
            
            for card in movie_cards:
                try:
                    a_tag = card.find_element(By.CSS_SELECTOR, "h3.entry-title a")
                    href = a_tag.get_attribute("href")
                    title = a_tag.text.strip()
                    
                    if any(r['link'] == href for r in results):
                        continue
                        
                    image = ""
                    try:
                        img_el = card.find_element(By.CSS_SELECTOR, "img.blog-picture")
                        image = img_el.get_attribute("src")
                    except:
                        pass
                        
                    results.append({
                        "title": title,
                        "link": href,
                        "image": image,
                        "quality": "MoviesNation"
                    })
                except Exception as e:
                    print(f"Error parsing MoviesNation card: {e}")
                    continue
            
        print(f"Total results found: {len(results)}")
                
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        driver.quit()
        
    return jsonify({"results": results})

@app.route('/details', methods=['POST'])
def get_details():
    data = request.json
    link = data.get('link')
    
    if not link:
        return jsonify({"error": "Link is required"}), 400
        
    driver = get_driver()
    sections = []
    
    try:
        print(f"Fetching details for: {link}")
        driver.get(link)
        
        if "moviesnation.health" in link:
            # Wait for MoviesNation content
            content_div = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CLASS_NAME, "entry-content"))
            )
            links = content_div.find_elements(By.TAG_NAME, "a")
            for l in links:
                href = l.get_attribute("href")
                if not href: continue
                text = l.text.strip()
                if "bollydrive.lol" in href or any(q in text for q in ["480p", "720p", "1080p", "2160p", "Zip", "Episode"]):
                    if text and "MoviesNation" not in text and "Download Daredevil" not in text:
                        sections.append({
                            "header": text,
                            "links": [{
                                "text": "⚡ Download [Direct]",
                                "url": href
                            }]
                        })
                
        else:
            # Wait for the main content to load (VegaMovies/RogMovies)
            page_body = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CLASS_NAME, "page-body"))
            )
            
            # We iteration through headers and their following content
            elements = page_body.find_elements(By.XPATH, "./h2 | ./h3 | ./h4 | ./h5 | ./p | ./hr")
            
            current_section = {"header": "General Links", "links": []}
            
            for el in elements:
                if el.tag_name in ["h2", "h3", "h4", "h5"]:
                    # If we have a header, start a new section
                    if current_section["links"]:
                        sections.append(current_section)
                    current_section = {"header": el.text.strip(), "links": []}
                
                elif el.tag_name == "p":
                    # Find all download links in this paragraph
                    links = el.find_elements(By.TAG_NAME, "a")
                    for l in links:
                        href = l.get_attribute("href")
                        text = l.text.strip()
                        # Filter for known download hosters or button text
                        if href and ("nexdrive.pro" in href or "G-Direct" in text or "V-Cloud" in text or "Batch" in text):
                            current_section["links"].append({
                                "text": text if text else "Download Link",
                                "url": href
                            })
            
            # Append the last section
            if current_section["links"]:
                sections.append(current_section)
        
        print(f"Extracted {len(sections)} sections")
                
    except Exception as e:
        print(f"Error extracting details: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        driver.quit()
        
    return jsonify({"sections": sections})

@app.route('/episodes', methods=['POST'])
def get_episodes():
    data = request.json
    link = data.get('link')
    
    if not link:
        return jsonify({"error": "Link is required"}), 400
        
    driver = get_driver()
    episodes = []
    
    try:
        print(f"Fetching final episodes from: {link}")
        driver.get(link)
        
        if "bollydrive.lol/file" in link or "bollydrive.lol/new/file" in link:
            # Final download page with cloud buttons
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "button"))
            )
            buttons = driver.find_elements(By.TAG_NAME, "button")
            for b in buttons:
                onclick = b.get_attribute("onclick")
                text = b.text.strip()
                if onclick and "openMirrorWithLoader" in onclick:
                    import re
                    match = re.search(r"openMirrorWithLoader\(this,\s*'([^']+)'\)", onclick)
                    if match:
                        episodes.append({
                            "text": text if text else "Download Link",
                            "url": match.group(1)
                        })

        elif "links.bollydrive.lol/archives" in link:
            # Episodes list page
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "a"))
            )
            anchors = driver.find_elements(By.TAG_NAME, "a")
            for a in anchors:
                href = a.get_attribute("href")
                if not href: continue
                text = a.text.strip()
                if "bollydrive.lol/file" in href or "bollydrive.lol//file" in href:
                    episodes.append({
                        "text": text if text else "Episode Link",
                        "url": href
                    })

        else:
            # Intermediate pages usually have a 'btn' or 'button' or specific download link
            # Based on user description, final links are often vcloud.zip or similar buttons
            # Sometimes there's a "Click here to Continue" or similar logic, but for direct links:
            
            # Wait for potential buttons to load
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.TAG_NAME, "a"))
            )
            
            # Look for buttons that look like Episodes or Download
            anchors = driver.find_elements(By.TAG_NAME, "a")
            for a in anchors:
                href = a.get_attribute("href")
                text = a.text.strip()
                
                # Match final download patterns: vcloud, fastdl, filebee, and text includes zip/batch/episode
                if href and ("vcloud.zip" in href or "fastdl.zip" in href or "filebee" in href or 
                             "Download" in text or "Episode" in text or "G-Direct" in text or 
                             "V-Cloud" in text or "Zip" in text):
                    episodes.append({
                        "text": text if text else "Download Link",
                        "url": href
                    })
            
            # If no links found, it might be a redirected/landing page
            if not episodes:
                 print("No direct links found, checking for buttons...")
                 buttons = driver.find_elements(By.TAG_NAME, "button")
                 for b in buttons:
                     # Logic for clicking "Generate Link" could go here if needed
                     pass

    except Exception as e:
        print(f"Error extracting episodes: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        driver.quit()
        
    return jsonify({"episodes": episodes})

if __name__ == '__main__':
    try:
        from constants import DEBUG
    except ImportError:
        DEBUG = False
    
    if DEBUG:
        print("Starting development server on port 5002...")
        app.run(port=5002, debug=True)
    else:
        from waitress import serve
        print("Starting production server on port 5002 with Waitress...")
        serve(app, host='0.0.0.0', port=5002)
