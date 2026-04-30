import requests
import json

def test_search():
    print("Testing Search...")
    url = "http://localhost:5000/search"
    payload = {"query": "daredevil"}
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_details(link):
    print(f"\nTesting Details for: {link}")
    url = "http://localhost:5000/details"
    payload = {"link": link}
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_episodes(link):
    print(f"\nTesting Final Episodes for: {link}")
    url = "http://localhost:5000/episodes"
    payload = {"link": link}
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    results = test_search()
    if results.get("results"):
        first_movie = results["results"][0]["link"]
        details = requests.post("http://localhost:5000/details", json={"link": first_movie}).json()
        
        if details.get("sections"):
            # Test with the first link of the first section (e.g., G-Direct or V-Cloud)
            first_download_link = details["sections"][0]["links"][0]["url"]
            test_episodes(first_download_link)
