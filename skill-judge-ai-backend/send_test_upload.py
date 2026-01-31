import requests, json

f = "test_resume.docx"
url = "http://127.0.0.1:8000/api/resume/upload"

with open(f, "rb") as fh:
    r = requests.post(url, files={"file": (f, fh, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
    print(r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text)
