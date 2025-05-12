from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Depends
from sqlalchemy.orm import Session

database_URL = "sqlite:///./todo.db"

engine = create_engine(database_URL,connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class ItemModel(Base):
    __tablename__="items"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    checked = Column(Boolean,default=False)
    count = Column(Integer,default=0)
    category = Column(String,nullable=False)


Base.metadata.create_all(bind=engine)



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fuji620.github.io"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

items = []


class Item(BaseModel):
    name: str
    checked: bool = False
    category: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items")  #データを取得
def read_items(db: Session = Depends(get_db)):
    items = db.query(ItemModel).all()
    return items

@app.post("/items")  #追加
def create_item(item:Item,db:Session = Depends(get_db)):
    new_item = ItemModel(name = item.name, checked = item.checked,category = item.category)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.delete("/items/{item_id}")  #削除
def delete_item(item_id: int,db:Session = Depends(get_db)):
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    db.delete(item)
    db.commit()
    if item:
        db.delete(item)
        db.commit()

@app.get("/checkbox_state")
def get_checkbox_state(db:Session = Depends(get_db)):
    checkbox = db.query(ItemModel).all()
    return checkbox

class Count(BaseModel):
    counted: int

@app.put("/count_state/{item_id}")
def update_count(item_id: int,count: Count,db: Session = Depends(get_db)):
    count_update = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    count_update.count= count.counted
    db.commit()
    db.refresh(count_update)
    return count_update

class UpdateItem(BaseModel):
    name:str
    checked: bool
    category: str
    count : int

@app.put("/items/{item_id}")
def update_item(item_id: int, item: UpdateItem, db: Session = Depends(get_db)):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if db_item:
        db_item.name = item.name
        db_item.checked = item.checked
        db_item.category = item.category
        db_item.count = item.count
        db.commit()
        db.refresh(db_item)
        return db_item