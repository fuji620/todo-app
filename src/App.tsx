import { useState,useEffect} from "react";
import axios from "axios";
import React from "react";
import './App.css';

const fast_API_URL = "http://127.0.0.1:8000";
const items_URL = `${fast_API_URL}/items`;

type Item = {
    id: number;
    name: string;
    checked: boolean;
    category: string;
    count: number;
}


function App() {
    const [items,setItems] = useState<Item[]>([]);
    const [name,setName] = useState<string>("");
    const [currentcategory,setCurrentcategory] = useState<string>("果物")
    const [hasChanges, setHasChanges] = useState(false);

    const countItems = async (id:number,newCount:number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? {...item,count:newCount } : item
            )
        );
        setHasChanges(true);
    };


    const fetchItems = async () => {
        const response = await axios.get(items_URL);
        setItems(response.data);
    };

    const handleCheckboxChange = (item: Item) => {
        setItems(prev =>
        prev.map(i =>
            i.id === item.id ? { ...i, checked: !i.checked } : i
        )
        );
        setHasChanges(true);
    };
    
    const allsave = async () => {
        for (const item of items) {
            await axios.put(`${fast_API_URL}/items/${item.id}`, item);
        }
        setHasChanges(false);
        };

    const handleCategoryChange = async (newCategory: string) => {
        if (hasChanges) {
        await allsave();
        }
        setCurrentcategory(newCategory);
        fetchItems();
    };


    const addItem = async () => {
        await axios.post(items_URL,{ name, checked: false,category:currentcategory});
        setName("");
        fetchItems();
    };

    const deleteItem = async (id: number) => {
        await axios.delete(`${fast_API_URL}/items/${id}`);
        setItems(prev => prev.filter(item => item.id !== id));
    };


    const updateItem = async (id:number, newName:string,checked:boolean,category:string,count:number) => {
        await axios.put(`${items_URL}/${id}`, { name: newName,checked:checked,category:category,count:count });
    };

    
    const updateCheckboxState = async (id:number, newChecked:boolean) => {
        const url = `${items_URL}/${id}`; 


        try {
            await axios.put(url, { checked: newChecked });
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === id ? { ...item, checked: newChecked } : item
                )
            );
        } catch (error) {
            console.error("エラーだよ",error);
        }
    };
    


    useEffect(() => {
        fetchItems();
    }, []);
    

return(
    <>
    <div className="flex flex-col items-center justify-center min-h-screen --color-accent-content">
    <h1 className="text-3xl font-bold mb-4">Todo list</h1>
            <div className="category-tabs">
            {["家電","果物","消耗品"].map((cat) => (
                <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className="btn btn-accent"
                >
                {cat}
                </button>
                
            ))}
        </div>
        <input className="text-justify"
            type="text"
            placeholder="new items"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addItem}>追加</button>

        <ul>
            {items
                .filter((item) => item.category === currentcategory)
                .map((item) => (
                <li key={item.id} className="flex items-center justify-center gap-2 my-2">
                    <input
                        type="checkbox"
                        checked={item.checked}
                        className="checkbox checkbox-neutral"
                        onChange={() => handleCheckboxChange(item)}
                    />
                    <span style={{ margin: "0 10px" }}></span>
                    {item.name}
                    <span style={{ margin: "0 5px "}}></span>
                    <button onClick={() => deleteItem(item.id)}>削除</button>

                    <span style={{ margin: "0 10px"}}></span>
                    <span>{item.count}</span>
                    <span style={{margin: "0 10px"}}></span>
                    <button onClick={() => countItems(item.id, item.count + 1)}> + </button>
                    <button onClick={() => countItems(item.id, item.count - 1)}> - </button>

                </li>
            ))}
        </ul>
    </div>


    <div className="absolute top-4 right-4">
    <div className="bg-base-300 text-black p-4 rounded-lg">
    <div className="card-body">
    <h1 className="text-3xl font-bold mb-4">編集</h1>
        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    <input
                        type="text"
                        defaultValue={item.name}
                        onBlur={(e) => updateItem(item.id,e.target.value,item.checked,item.category,item.count)}
                        />
                </li>
            ))}
        </ul>
    </div>
    </div>
    </div>
</>
);
}
export default App;
        //fetchItems(); // ← 表示を更新