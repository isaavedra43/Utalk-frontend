import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Seller } from "@/types/api";

interface TrendChartsProps {
    seller: Seller;
}

export function TrendCharts({ seller }: TrendChartsProps) {
    if (!seller.trends) {
        return <div className="text-center p-4">No hay datos de tendencias disponibles.</div>;
    }

    const salesData = seller.trends.chatsVsSales.map((chats, index) => ({
        name: `Día ${index + 1}`,
        chats,
        sales: Math.round(chats * (seller.kpis.conversionRate / 100)),
    }));

    const responseData = seller.trends.responseTime.map((time, index) => ({
        name: `Día ${index + 1}`,
        "Tiempo (s)": time,
    }));

    return (
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Tendencias de Rendimiento</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Chats vs Ventas */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-md font-semibold text-white mb-4">Chats vs Ventas</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Bar yAxisId="left" dataKey="chats" fill="#3b82f6" name="Chats" />
                            <Bar yAxisId="right" dataKey="sales" fill="#22c55e" name="Ventas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Tiempo de Respuesta */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-md font-semibold text-white mb-4">Tiempo de Respuesta Promedio</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={responseData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#f59e0b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Line type="monotone" dataKey="Tiempo (s)" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
