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

    const countItems = async (id:number,newCount:number) => {
        await axios.put(`${fast_API_URL}/count_state/${id}`,{counted: newCount});
        fetchItems();
    }


    const fetchItems = async () => {
        const response = await axios.get(items_URL);
        setItems(response.data);
    };

    const handleCheckboxChange = async (item:Item) => {
        const updatedItem = {
        id: item.id,
        name: item.name,
        checked: !item.checked,
        category: item.category,
        count: item.count,
        };
        await axios.put(`${items_URL}/${item.id}`, updatedItem);
        fetchItems(); // ← 表示を更新
    };



    const addItem = async () => {
        await axios.post(items_URL,{ name, checked: false,category:currentcategory});
        setName("");
        //fetchItems();
    };

    const deleteItem = async (id:number) => {
        await axios.delete(`${items_URL}/${id}`);
        //fetchItems();
    };

    const updateItem = async (id:number, newName:string,checked:boolean,category:string) => {
        await axios.put(`${items_URL}/${id}`, { name: newName,checked:checked,category:category });
        fetchItems();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-3xl font-bold mb-4">Todo list</h1>
            <div className="category-tabs">
            {["家電","果物","消耗品"].map((cat) => (
                <button
                key={cat}
                onClick={() => setCurrentcategory(cat)}
                className="btn btn-accent"
                >
                {cat}
                </button>
                
            ))}
        </div>
        <input
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
                        defaultChecked className="checkbox checkbox-neutral"
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

        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    <input
                        type="text"
                        defaultValue={item.name}
                        onBlur={(e) => updateItem(item.id,e.target.value,item.checked,item.category)}
                        />
                </li>
            ))}
        </ul>
    </div>
);
}
export default App;
