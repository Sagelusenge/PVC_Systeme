import { Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatAmount = (value) => `${Number(value || 0).toLocaleString("fr-FR")} $US`;

export default function SalesChart({ total = 0 }) {
  const data = [.58, .72, .68, .84, 1].map((factor, index) => {
    const sales = Math.round(total * factor);
    const costs = Math.round(sales * .62);
    return {
      name: `SEM ${index + 1}`,
      ventes: sales,
      couts: costs,
      marge: sales - costs,
    };
  });

  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid stroke="#27344c" strokeDasharray="3 3" vertical={false}/>
      <XAxis dataKey="name" stroke="#7e899f" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}/>
      <YAxis stroke="#7e899f" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}/>
      <Tooltip formatter={formatAmount} contentStyle={{ background: "#1c2940", border: "1px solid #3b4962", fontSize: 11 }}/>
      <Legend wrapperStyle={{ fontSize: 10 }}/>
      <Bar dataKey="ventes" name="Ventes" fill="#2d6bea" radius={[2, 2, 0, 0]}/>
      <Bar dataKey="couts" name="Couts d'extrusion" fill="#d97706" radius={[2, 2, 0, 0]}/>
      <Line dataKey="marge" name="Marge brute" stroke="#68dfb1" strokeWidth={2}/>
    </BarChart>
  </ResponsiveContainer>;
}
