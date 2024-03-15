import requests
import json

object_endpoint = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"

def fetch_object_details(object_id):
    response = requests.get(object_endpoint + str(object_id))
    if response.status_code == 200:
        return response.json()
    else:
        return None

def fetch_and_save_objects(object_ids, filename):
    objects_data = {"artworks": []}
    for object_id in object_ids:
        object_details = fetch_object_details(object_id)
        if object_details:
            objects_data["artworks"].append(object_details)
        if len(objects_data["artworks"]) >= 100:
            break
    
    with open(filename, 'w') as f:
        json.dump(objects_data, f, indent=4)

if __name__ == "__main__":
    response = requests.get("https://collectionapi.metmuseum.org/public/collection/v1/search?medium=Paintings|Sculpture&q=europe")
    if response.status_code == 200:
        print(response.json()["total"])
        object_ids = response.json()["objectIDs"]
        fetch_and_save_objects(object_ids, "db.json")
        print("Objects fetched and saved successfully.")
    else:
        print("Failed to fetch objects.")
