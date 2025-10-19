import React from 'react';
import { Card } from '../ui/Card.jsx';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadIcon, FilterIcon, CalendarIcon } from 'lucide-react';
export const Reports = () => {
  // Sample data for charts
  const monthlyData = [{
    name: 'Jan',
    plastic: 65,
    paper: 45,
    organic: 30,
    metal: 20,
    ewaste: 10
  }, {
    name: 'Feb',
    plastic: 59,
    paper: 48,
    organic: 35,
    metal: 18,
    ewaste: 12
  }, {
    name: 'Mar',
    plastic: 80,
    paper: 52,
    organic: 40,
    metal: 25,
    ewaste: 15
  }, {
    name: 'Apr',
    plastic: 81,
    paper: 60,
    organic: 45,
    metal: 30,
    ewaste: 13
  }, {
    name: 'May',
    plastic: 56,
    paper: 45,
    organic: 50,
    metal: 28,
    ewaste: 14
  }, {
    name: 'Jun',
    plastic: 55,
    paper: 48,
    organic: 55,
    metal: 22,
    ewaste: 16
  }];
  const impactData = [{
    name: 'Week 1',
    items: 40,
    emissions: 28
  }, {
    name: 'Week 2',
    items: 45,
    emissions: 26
  }, {
    name: 'Week 3',
    items: 60,
    emissions: 22
  }, {
    name: 'Week 4',
    items: 75,
    emissions: 18
  }, {
    name: 'Week 5',
    items: 80,
    emissions: 16
  }, {
    name: 'Week 6',
    items: 85,
    emissions: 14
  }];
  const categoryData = [{
    name: 'Plastic',
    value: 40
  }, {
    name: 'Paper',
    value: 25
  }, {
    name: 'Organic',
    value: 20
  }, {
    name: 'Metal',
    value: 10
  }, {
    name: 'E-Waste',
    value: 5
  }];
  const COLORS = ['#4ade80', '#60a5fa', '#fcd34d', '#f87171', '#a78bfa'];

  // --- export helpers (added) ---
  const topItems = [
    { item: 'Plastic Water Bottle', category: 'Plastic', count: 156, recycled: '92%' },
    { item: 'Cardboard Box', category: 'Paper', count: 124, recycled: '98%' },
    { item: 'Food Scraps', category: 'Organic', count: 105, recycled: '75%' },
    { item: 'Aluminum Can', category: 'Metal', count: 87, recycled: '95%' },
    { item: 'Old Smartphone', category: 'E-Waste', count: 42, recycled: '100%' }
  ];

  const arrayToCSV = (arr) => {
    if (!arr || !arr.length) return '';
    const keys = Object.keys(arr[0]);
    const header = keys.join(',');
    const rows = arr.map(r => keys.map(k => {
      const v = r[k] == null ? '' : String(r[k]);
      return `"${v.replace(/"/g, '""')}"`;
    }).join(','));
    return [header, ...rows].join('\r\n');
  };

  const exportReport = () => {
    const sections = [];
    sections.push('"Monthly Classification by Category"');
    sections.push(arrayToCSV(monthlyData));
    sections.push('');
    sections.push('"Environmental Impact Trends"');
    sections.push(arrayToCSV(impactData));
    sections.push('');
    sections.push('"Waste Category Distribution"');
    sections.push(arrayToCSV(categoryData.map(d => ({ name: d.name, value: d.value }))));
    sections.push('');
    sections.push('"Top Classified Items"');
    sections.push(arrayToCSV(topItems.map(t => ({ Item: t.item, Category: t.category, Count: t.count, Recycled: t.recycled }))));

    const csvContent = sections.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const filename = `ecoai_report_${now.toISOString().slice(0,10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Waste Management Reports
        </h1>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
              <CalendarIcon size={16} className="mr-2 text-gray-500" />
              <span>Last 30 days</span>
            </button>
            <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
              <FilterIcon size={16} className="mr-2 text-gray-500" />
              <span>Filter</span>
            </button>
          </div>
          <button onClick={exportReport} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <DownloadIcon size={16} className="mr-2" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              Total Items Classified
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-800">1,248</p>
            <p className="mt-1 text-sm text-green-600">+12% from last month</p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Recycling Rate</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">78%</p>
            <p className="mt-1 text-sm text-green-600">+5% from last month</p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              CO₂ Emissions Saved
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-800">342 kg</p>
            <p className="mt-1 text-sm text-green-600">+8% from last month</p>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Classification by Category">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plastic" name="Plastic" fill="#60a5fa" />
                <Bar dataKey="paper" name="Paper" fill="#4ade80" />
                <Bar dataKey="organic" name="Organic" fill="#fcd34d" />
                <Bar dataKey="metal" name="Metal" fill="#f87171" />
                <Bar dataKey="ewaste" name="E-Waste" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Environmental Impact Trends">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="items" name="Items Recycled" stroke="#4ade80" activeDot={{
                r: 8
              }} />
                <Line yAxisId="right" type="monotone" dataKey="emissions" name="CO₂ Emissions (kg)" stroke="#f87171" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Waste Category Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top Classified Items" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recycled
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Plastic Water Bottle
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Plastic
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    156
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    92%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Cardboard Box
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Paper
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    124
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    98%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Food Scraps
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Organic
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    105
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    75%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Aluminum Can
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Metal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    87
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    95%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Old Smartphone
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    E-Waste
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    42
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>;
};