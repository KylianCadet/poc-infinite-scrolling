from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Item
from math import ceil

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/items")
def get_items(page: Union[int, None] = 1, limit: Union[int, None] = 20):
    query = Item.select().paginate(page, limit).dicts()
    count = Item.select().count()
    data = list(query)
    return {
        "data": data,
        "page": page,
        "total_page": ceil(count / limit),
        "count": count
    }
