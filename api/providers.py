"""Provider credentials belong to the local API process."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

private_dir = Path(os.environ.get("LOCALAPPDATA") or Path.home() / ".config") / "AnyJob"
load_dotenv(private_dir / ".env", override=False, interpolate=False)

def local_only(request: Request):
    local = {"localhost", "127.0.0.1", "::1"}
    origin = request.headers.get("origin")
    if (request.url.hostname not in local or not request.client or request.client.host not in local
        or (origin and urlparse(origin).hostname not in local)):
        raise HTTPException(403, "Use AnyJob on your local computer.")

router = APIRouter(prefix="/api/providers", dependencies=[Depends(local_only)])

@router.get("/status")
def status():
    return {"kilo": bool(os.getenv("KILO_API_KEY")), "apify": bool(os.getenv("APIFY_API_TOKEN"))}

class RankRequest(BaseModel):
    cv: str = Field(min_length=1, max_length=80000)
    jd: str = Field(min_length=1, max_length=50000)
    tone: str = Field(default="Balanced", max_length=40)

@router.post("/kilo/rank")
def rank(body: RankRequest):
    key = os.getenv("KILO_API_KEY")
    if not key:
        raise HTTPException(503, "Set KILO_API_KEY in the backend environment.")
    lines = body.cv.split("\n")
    try:
        r = httpx.post("https://ai-gateway.kilo.ai/api/v1/chat/completions",
            headers={"Authorization": "Bearer " + key},
            json={"model": os.getenv("KILO_MODEL", "kilo-auto"), "temperature": 0,
                  "messages": [{"role":"system","content":"Rank CV line numbers by relevance to the posting. Return only JSON of the form {\"order\":[0,1]}. Never change CV text."},
                               {"role":"user","content":json.dumps({"lines":list(enumerate(lines)), "job":body.jd, "tone":body.tone})}]},
            timeout=45)
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"].strip()
        order = json.loads(re.sub(r"^" + chr(96)*3 + r"(?:json)?\s*|\s*" + chr(96)*3 + r"$", "", content))["order"]
        if not isinstance(order,list) or not order or any(type(i) is not int or not 0 <= i < len(lines) for i in order):
            raise ValueError()
        return {"order":list(dict.fromkeys(order))}
    except (httpx.HTTPError, KeyError, TypeError, IndexError, ValueError):
        raise HTTPException(502,"Kilo could not rank this CV. Check credentials, model and credits, or choose local preparation.")

@router.get("/apify/jobs/{dataset}")
def dataset_jobs(dataset: str):
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}",dataset):
        raise HTTPException(400,"Enter an Apify dataset ID.")
    key=os.getenv("APIFY_API_TOKEN")
    if not key:
        raise HTTPException(503,"Set APIFY_API_TOKEN in the backend environment.")
    try:
        r=httpx.get(f"https://api.apify.com/v2/datasets/{dataset}/items", params={"clean":"true","limit":50},headers={"Authorization":"Bearer "+key},timeout=20)
        r.raise_for_status()
        items=r.json()
        if not isinstance(items,list):
            raise ValueError()
    except (httpx.HTTPError,ValueError):
        raise HTTPException(502,"Could not read this Apify dataset. Check its ID and token permissions.")
    jobs=[]
    for i,row in enumerate(items):
        if not isinstance(row,dict):
            continue
        title=row.get("title") or row.get("jobTitle")
        if not isinstance(title,str) or not title.strip():
            continue
        values=[row.get("companyName") or row.get("company"),row.get("location"),row.get("descriptionText") or row.get("description"),row.get("jobUrl") or row.get("url") or row.get("link")]
        company,location,description,url=[v if isinstance(v,str) else "" for v in values]
        jobs.append(dict(id=f"apify:{dataset}:{i}",title=title,company=company,location=location,description=description,source_url=url if url.startswith(("http://","https://")) else "",source="apify"))
    return {"jobs":jobs}

