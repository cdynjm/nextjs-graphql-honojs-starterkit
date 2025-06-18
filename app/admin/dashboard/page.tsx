"use client";

import { usePageTitle } from "@/components/page-title-context";
import { useEffect } from "react";
import { Users, Folder, FileText } from "lucide-react";

export default function DashboardPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Dashboard");
    return () => setTitle("");
  }, [setTitle]);

  const stats = [
    {
      title: "Sample Card 1",
      value: 1,
      bg: "bg-green-50",
      icon: <Users className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 2",
      value: 4,
      bg: "bg-blue-50",
      icon: <Folder className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 3",
      value: 0,
      bg: "bg-red-50",
      icon: <FileText className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 4",
      value: 2,
      bg: "bg-yellow-50",
      icon: <Users className="w-5 h-5 text-gray-500" />,
    },
  ];

  return (
    <section className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl overflow-hidden bg-white"
          >
            <div className={`flex justify-between items-center px-4 py-2 ${item.bg}`}>
              <h3 className="text-sm font-semibold text-gray-700">{item.title}</h3>
              {item.icon}
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
