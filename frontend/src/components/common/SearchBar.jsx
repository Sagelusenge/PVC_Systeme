import { Search } from "lucide-react";
export default function SearchBar({ value, onChange, placeholder = "Rechercher..." }) { return <label className="search"><Search /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>; }
